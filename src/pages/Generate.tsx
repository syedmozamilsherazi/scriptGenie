import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, Loader2, Sparkles, History, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SavedScriptsDialog from "@/components/SavedScriptsDialog";

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

const Generate = () => {
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>([]);
  const [error, setError] = useState("");
  const [showSavedScripts, setShowSavedScripts] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Generate Script</h1>
              <p className="text-muted-foreground">
                Paste your content below and let AI create a polished YouTube script
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowSavedScripts(true)}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              Saved Scripts ({savedScripts.length})
            </Button>
          </div>
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

        {/* Saved Scripts Dialog */}
        <SavedScriptsDialog
          open={showSavedScripts}
          onOpenChange={setShowSavedScripts}
          savedScripts={savedScripts}
          onCopy={handleCopy}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default Generate;
