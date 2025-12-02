import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { Copy, Trash2, ChevronDown, Loader2, Sparkles } from "lucide-react";

interface SavedScript {
  id: string;
  transcript: string;
  result: string;
  timestamp: number;
}

const STORAGE_KEY = "youtube-scripts";
const WEBHOOK_URL = "https://n8n-14pv.onrender.com/webhook/31cc881b-c4ab-4335-b7a8-5f9fb2cd73ce";

const loadingStages = [
  "Sending to server…",
  "Processing your content…",
  "Analyzing structure…",
  "Generating script…",
  "Optimizing output…",
  "Almost there…",
  "Finalizing…",
  "Still working on it…"
];

const Index = () => {
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>([]);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setSavedScripts(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingStage((prev) => {
          // If at the last stage, loop between last two stages
          if (prev >= loadingStages.length - 1) {
            return loadingStages.length - 2;
          }
          return prev + 1;
        });
      }, 20000);
      return () => clearInterval(interval);
    } else {
      setLoadingStage(0);
    }
  }, [isLoading]);

  const handleGenerate = async () => {
    if (!transcript.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to generate a script.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setLoadingStage(0);
    setError("");
    setResult("");

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }

      // Try to parse as JSON first, if that fails, use as plain text
      const responseText = await response.text();
      let scriptResult: string;
      
      try {
        const jsonData = JSON.parse(responseText);
        scriptResult = typeof jsonData === 'string' ? jsonData : (jsonData.merged || jsonData.output || JSON.stringify(jsonData, null, 2));
      } catch {
        // Response is plain text, use it directly
        scriptResult = responseText;
      }
      
      setResult(scriptResult);

      const newScript: SavedScript = {
        id: Date.now().toString(),
        transcript,
        result: scriptResult,
        timestamp: Date.now(),
      };

      const updatedScripts = [newScript, ...savedScripts];
      setSavedScripts(updatedScripts);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScripts));

      toast({
        title: "Success!",
        description: "Script generated successfully.",
      });
    } catch (err) {
      console.error("Generation error:", err);
      setError("Something went wrong. Please try again. Check console for details.");
      toast({
        title: "Error",
        description: "Failed to generate script.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Script copied to clipboard.",
    });
  };

  const handleDelete = (id: string) => {
    const updatedScripts = savedScripts.filter((script) => script.id !== id);
    setSavedScripts(updatedScripts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScripts));
    toast({
      title: "Deleted",
      description: "Script removed from history.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero Section */}
        <header className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            AI YouTube Script Generator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Paste any article or transcript and get a full, polished script.
          </p>
        </header>

        {/* Input Section */}
        <Card className="mb-8 shadow-lg animate-slide-up">
          <CardContent className="pt-6">
            <label htmlFor="transcript" className="block text-sm font-medium mb-2">
              Paste article or transcript here
            </label>
            <Textarea
              id="transcript"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Enter your content here..."
              className="min-h-[200px] resize-y text-base"
              disabled={isLoading}
            />
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full mt-4 h-12 text-base font-semibold"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {loadingStages[loadingStage]}
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

        {/* Loading Stages Indicator */}
        {isLoading && (
          <Card className="mb-8 border-primary/20 bg-primary/5 animate-pulse-glow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                {loadingStages.map((stage, index) => (
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
                {loadingStages[loadingStage]}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-8 border-destructive bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive text-center font-medium">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Result Card */}
        {result && !isLoading && (
          <Card className="mb-8 shadow-xl animate-slide-up">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">Generated Script</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(result)}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-y-auto bg-muted/30 rounded-lg p-6">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {result}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Saved Scripts */}
        {savedScripts.length > 0 && (
          <div className="animate-slide-up">
            <h2 className="text-3xl font-bold mb-6">Saved Scripts</h2>
            <div className="space-y-4">
              {savedScripts.map((script) => (
                <Collapsible key={script.id}>
                  <Card className="overflow-hidden transition-all hover:shadow-md">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="flex flex-row items-center justify-between py-4">
                        <div className="flex items-center gap-3 flex-1">
                          <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform ui-expanded:rotate-180" />
                          <div className="text-left">
                            <p className="text-sm text-muted-foreground">
                              {new Date(script.timestamp).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              {script.transcript.substring(0, 100)}...
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(script.result)}
                            className="gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(script.id)}
                            className="gap-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-2 text-sm">Original Input:</h4>
                          <p className="text-sm text-muted-foreground mb-4 bg-muted/30 p-3 rounded">
                            {script.transcript}
                          </p>
                          <h4 className="font-semibold mb-2 text-sm">Generated Script:</h4>
                          <div className="max-h-[300px] overflow-y-auto bg-muted/30 rounded p-3">
                            <pre className="whitespace-pre-wrap font-sans text-sm">
                              {script.result}
                            </pre>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
