import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, Loader2, Sparkles, Search, FileText, AlertCircle } from "lucide-react";
import SavedScriptsDialog from "@/components/SavedScriptsDialog";
import HistorySidebar from "@/components/HistorySidebar";
import { getWordUsage, addWordUsage, subtractWordUsage } from "@/lib/wordUsageApi";

interface SavedScript {
  id: string;
  originalArticle: string;
  outline: string;
  result: string;
  timestamp: number;
  wordCount?: number;
}

const STORAGE_KEY = "youtube-scripts";
const MAX_WORDS = 40000;
const ANALYZE_WEBHOOK_URL = "https://n8n-14pv.onrender.com/webhook/6cd46bb2-4ab9-44a1-a055-68be14b77b08";
const GENERATE_WEBHOOK_URL = "https://n8n-14pv.onrender.com/webhook/31cc881b-c4ab-4335-b7a8-5f9fb2cd73ce";

const analyzeLoadingStages = [
  "Sending to Perplexity…",
  "Searching the web…",
  "Gathering facts…",
  "Compiling research…",
  "Building outline…",
  "Almost there…",
  "Finalizing research…",
  "Still searching…"
];

const generateLoadingStages = [
  "Sending to Claude…",
  "Writing Part 1…",
  "Crafting the narrative…",
  "Writing Part 2…",
  "Polishing the script…",
  "Almost there…",
  "Finalizing script…",
  "Still writing…"
];

type WorkflowStep = "input" | "outline" | "result";

const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

const Generate = () => {
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>("input");
  const [originalArticle, setOriginalArticle] = useState("");
  const [outline, setOutline] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [currentLoadingStages, setCurrentLoadingStages] = useState<string[]>(analyzeLoadingStages);
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>([]);
  const [wordUsage, setWordUsage] = useState(0);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  const [currentScriptId, setCurrentScriptId] = useState<string>();
  const [error, setError] = useState("");
  const [showSavedScripts, setShowSavedScripts] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Load saved scripts from localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setSavedScripts(JSON.parse(saved));
        }

        // Load word usage from API
        const usageData = await getWordUsage();
        if (usageData) {
          setWordUsage(usageData.wordUsage);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setIsLoadingUsage(false);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingStage((prev) => {
          if (prev >= currentLoadingStages.length - 1) {
            return currentLoadingStages.length - 2;
          }
          return prev + 1;
        });
      }, 20000);
      return () => clearInterval(interval);
    } else {
      setLoadingStage(0);
    }
  }, [isLoading, currentLoadingStages]);

  const handleAnalyze = async () => {
    if (!originalArticle.trim()) {
      toast({
        title: "Error",
        description: "Please enter an article or transcript to analyze.",
        variant: "destructive",
      });
      return;
    }

    // Check if limit is reached
    if (wordUsage >= MAX_WORDS) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      
      toast({
        title: "Monthly Limit Reached",
        description: `You have exhausted your ${MAX_WORDS.toLocaleString()} word limit for this month. Your limit will reset on ${nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`,
        variant: "destructive",
        duration: 6000,
      });
      return;
    }

    setIsLoading(true);
    setLoadingStage(0);
    setCurrentLoadingStages(analyzeLoadingStages);
    setError("");
    setOutline("");

    try {
      const response = await fetch(ANALYZE_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cleanedTranscript: originalArticle }),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      let outlineResult: string;
      
      try {
        const jsonData = JSON.parse(responseText);
        outlineResult = typeof jsonData === 'string' 
          ? jsonData 
          : (jsonData.choices?.[0]?.message?.content || jsonData.output || jsonData.merged || JSON.stringify(jsonData, null, 2));
      } catch {
        outlineResult = responseText;
      }
      
      setOutline(outlineResult);
      setWorkflowStep("outline");

      toast({
        title: "Analysis Complete!",
        description: "Research outline generated. You can edit it before generating the script.",
      });
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Something went wrong during analysis. Please try again.");
      toast({
        title: "Error",
        description: "Failed to analyze content.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!outline.trim()) {
      toast({
        title: "Error",
        description: "Please provide an outline to generate the script.",
        variant: "destructive",
      });
      return;
    }

    // Check word limit
    if (wordUsage >= MAX_WORDS) {
      toast({
        title: "Word Limit Reached",
        description: `You have reached your ${MAX_WORDS.toLocaleString()} word limit. Clear history to reset.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setLoadingStage(0);
    setCurrentLoadingStages(generateLoadingStages);
    setError("");
    setResult("");

    try {
      const response = await fetch(GENERATE_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript: outline }),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      let scriptResult: string;
      
      try {
        const jsonData = JSON.parse(responseText);
        scriptResult = typeof jsonData === 'string' 
          ? jsonData 
          : (jsonData.merged || jsonData.output || JSON.stringify(jsonData, null, 2));
      } catch {
        scriptResult = responseText;
      }
      
      // Count words in result
      const wordCount = countWords(scriptResult);

      // Sync word count with API
      const updatedUsage = await addWordUsage(wordCount);
      
      if (!updatedUsage) {
        setError("Failed to save word usage. Please try again.");
        setResult(scriptResult);
        setWorkflowStep("result");
        toast({
          title: "Error",
          description: "Could not sync word usage with server",
          variant: "destructive",
        });
        return;
      }

      const newWordUsage = updatedUsage.wordUsage;

      // Check if exceeds limit after update
      if (newWordUsage > MAX_WORDS) {
        // Subtract the words since we exceeded the limit
        await subtractWordUsage(wordCount);
        setWordUsage(newWordUsage - wordCount);
        
        setError(`This script has ${wordCount.toLocaleString()} words, but you only have ${(MAX_WORDS - (newWordUsage - wordCount)).toLocaleString()} words remaining. The script has been generated but not saved.`);
        setResult(scriptResult);
        setWorkflowStep("result");
        toast({
          title: "Word Limit Exceeded",
          description: `Script exceeds limit. Generated: ${wordCount.toLocaleString()} words, Remaining: ${(MAX_WORDS - (newWordUsage - wordCount)).toLocaleString()} words`,
          variant: "destructive",
        });
        return;
      }

      setResult(scriptResult);
      setWorkflowStep("result");
      setWordUsage(newWordUsage);

      const newScript: SavedScript = {
        id: Date.now().toString(),
        originalArticle,
        outline,
        result: scriptResult,
        timestamp: Date.now(),
        wordCount,
      };

      setCurrentScriptId(newScript.id);

      const updatedScripts = [newScript, ...savedScripts];
      setSavedScripts(updatedScripts);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScripts));

      toast({
        title: "Success!",
        description: `YouTube script generated successfully. Used ${wordCount.toLocaleString()} words.`,
      });
    } catch (err) {
      console.error("Generation error:", err);
      setError("Something went wrong during script generation. Please try again.");
      toast({
        title: "Error",
        description: "Failed to generate script.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    // Check if limit is reached before allowing new script
    if (wordUsage >= MAX_WORDS) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      
      toast({
        title: "Monthly Limit Reached",
        description: `You have exhausted your ${MAX_WORDS.toLocaleString()} word limit for this month. Your limit will reset on ${nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`,
        variant: "destructive",
        duration: 6000,
      });
      return;
    }

    setWorkflowStep("input");
    setOriginalArticle("");
    setOutline("");
    setResult("");
    setError("");
    setCurrentScriptId(undefined);
  };

  const handleBackToOutline = () => {
    setWorkflowStep("outline");
    setResult("");
    setError("");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard.",
    });
  };

  const handleDelete = (id: string) => {
    const scriptToDelete = savedScripts.find(s => s.id === id);
    const wordCountToRemove = scriptToDelete?.wordCount || 0;
    
    const updatedScripts = savedScripts.filter((script) => script.id !== id);
    setSavedScripts(updatedScripts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScripts));
    
    // Sync deletion with API
    if (wordCountToRemove > 0) {
      subtractWordUsage(wordCountToRemove).then((updatedUsage) => {
        if (updatedUsage) {
          setWordUsage(updatedUsage.wordUsage);
        }
      });
    }
    
    if (currentScriptId === id) {
      setCurrentScriptId(undefined);
      setWorkflowStep("input");
    }
    
    toast({
      title: "Deleted",
      description: "Script removed from history.",
    });
  };

  const handleLoadFromHistory = (script: SavedScript) => {
    setOriginalArticle(script.originalArticle || (script as any).transcript || "");
    setOutline(script.outline || "");
    setResult(script.result);
    setWorkflowStep("result");
    setCurrentScriptId(script.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 flex">
      {/* Sidebar */}
      <HistorySidebar
        scripts={savedScripts}
        onSelect={handleLoadFromHistory}
        onDelete={handleDelete}
        onNewScript={handleStartOver}
        wordUsage={wordUsage}
        maxWords={MAX_WORDS}
        currentScriptId={currentScriptId}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Header */}
          <header className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Generate Script</h1>
                <p className="text-muted-foreground">
                  {workflowStep === "input" && "Step 1: Paste your article and analyze it"}
                  {workflowStep === "outline" && "Step 2: Review and edit the research outline"}
                  {workflowStep === "result" && "Step 3: Your generated YouTube script"}
                </p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2 mt-6">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                workflowStep === "input" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}>
                <span className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-xs">1</span>
                Article
              </div>
              <div className="h-px w-8 bg-muted" />
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                workflowStep === "outline" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}>
                <span className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-xs">2</span>
                Outline
              </div>
              <div className="h-px w-8 bg-muted" />
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                workflowStep === "result" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}>
                <span className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-xs">3</span>
                Script
              </div>
            </div>
          </header>

          {/* Step 1: Input Article */}
          {workflowStep === "input" && (
            <Card className="mb-8 shadow-lg animate-slide-up">
              <CardContent className="pt-6">
                <label htmlFor="article" className="block text-sm font-medium mb-2">
                  Paste your article or transcript here
                </label>
                <Textarea
                  id="article"
                  value={originalArticle}
                  onChange={(e) => setOriginalArticle(e.target.value)}
                  placeholder="Enter your article, news story, or transcript here. We'll analyze it and create a detailed research outline..."
                  className="min-h-[300px] resize-y text-base"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="w-full mt-4 h-12 text-base font-semibold"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {currentLoadingStages[loadingStage]}
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      Analyze & Research
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Outline (Editable) */}
          {workflowStep === "outline" && (
            <Card className="mb-8 shadow-lg animate-slide-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Research Outline
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStartOver}
                  >
                    Start Over
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Review and edit this outline before generating your script. Add or remove details as needed.
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={outline}
                  onChange={(e) => setOutline(e.target.value)}
                  className="min-h-[400px] resize-y text-base font-mono"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || wordUsage >= MAX_WORDS}
                  className="w-full mt-4 h-12 text-base font-semibold"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {currentLoadingStages[loadingStage]}
                    </>
                  ) : wordUsage >= MAX_WORDS ? (
                    <>
                      <AlertCircle className="mr-2 h-5 w-5" />
                      Word Limit Reached
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Script
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Result */}
          {workflowStep === "result" && !isLoading && (
            <Card className="mb-8 shadow-xl animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl">Generated YouTube Script</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBackToOutline}
                  >
                    Edit Outline
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(result)}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Script
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartOver}
                  >
                    New Script
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {error && (
                  <Card className="mb-4 border-yellow-500 bg-yellow-500/10">
                    <CardContent className="pt-4">
                      <p className="text-yellow-700 dark:text-yellow-400 text-sm flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                      </p>
                    </CardContent>
                  </Card>
                )}
                <div className="max-h-[600px] overflow-y-auto bg-muted/30 rounded-lg p-6">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {result}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading Stages Indicator */}
          {isLoading && (
            <Card className="mb-8 border-primary/20 bg-primary/5 animate-pulse-glow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  {currentLoadingStages.map((_, index) => (
                    <div key={index} className="flex items-center gap-2 flex-1">
                      <div
                        className={`h-2 rounded-full flex-1 transition-all duration-500 ${
                          index <= loadingStage
                            ? "bg-primary"
                            : "bg-muted"
                        }`}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-center mt-4 text-sm text-muted-foreground">
                  {currentLoadingStages[loadingStage]}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {error && !result && (
            <Card className="mb-8 border-destructive bg-destructive/10">
              <CardContent className="pt-6">
                <p className="text-destructive text-center font-medium">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Saved Scripts Dialog */}
          <SavedScriptsDialog
            open={showSavedScripts}
            onOpenChange={setShowSavedScripts}
            savedScripts={savedScripts}
            onCopy={handleCopy}
            onDelete={handleDelete}
            onLoad={handleLoadFromHistory}
          />
        </div>
      </div>
    </div>
  );
};

export default Generate;
