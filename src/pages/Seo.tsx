import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import HistorySidebar from "@/components/HistorySidebar";
import { useToast } from "@/hooks/use-toast";
import { getWordUsage, subtractWordUsage } from "@/lib/wordUsageApi";
import { generateYoutubeSeo, buildSeoHistoryItem, SeoResult } from "@/services/openaiSeo";
import { Copy, Loader2, Sparkles, Tags, Wand2, FileText } from "lucide-react";

interface SavedScript {
  id: string;
  originalArticle: string;
  outline: string;
  result: string;
  timestamp: number;
  wordCount?: number;
}

interface SavedSeoDescription extends SeoResult {
  id: string;
  script: string;
  timestamp: number;
}

const SCRIPT_STORAGE_KEY = "youtube-scripts";
const SEO_STORAGE_KEY = "youtube-seo-descriptions";
const MAX_WORDS = 40000;

const Seo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [scriptText, setScriptText] = useState("");
  const [seoResult, setSeoResult] = useState<SeoResult | null>(null);
  const [savedSeo, setSavedSeo] = useState<SavedSeoDescription[]>([]);
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentSeoId, setCurrentSeoId] = useState<string>();
  const [wordUsage, setWordUsage] = useState(0);

  useEffect(() => {
    const savedSeoRaw = localStorage.getItem(SEO_STORAGE_KEY);
    if (savedSeoRaw) {
      setSavedSeo(JSON.parse(savedSeoRaw));
    }

    const savedScriptsRaw = localStorage.getItem(SCRIPT_STORAGE_KEY);
    if (savedScriptsRaw) {
      setSavedScripts(JSON.parse(savedScriptsRaw));
    }

    getWordUsage()
      .then((usage) => {
        if (usage) {
          setWordUsage(usage.wordUsage);
        }
      })
  }, []);

  const handleGenerateSeo = async () => {
    if (!scriptText.trim()) {
      toast({
        title: "Script required",
        description: "Paste your YouTube script to generate SEO assets.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const seo = await generateYoutubeSeo(scriptText.trim());
      setSeoResult(seo);

      const historyItem = buildSeoHistoryItem(scriptText.trim(), seo);
      const updatedHistory = [historyItem, ...savedSeo];
      setSavedSeo(updatedHistory);
      localStorage.setItem(SEO_STORAGE_KEY, JSON.stringify(updatedHistory));
      setCurrentSeoId(historyItem.id);

      toast({
        title: "SEO copy ready",
        description: "5 titles, description, and tags generated with OpenAI.",
      });
    } catch (err) {
      console.error("OpenAI SEO error", err);
      setError("Something went wrong while generating SEO copy. Please try again.");
      toast({
        title: "Generation failed",
        description: "OpenAI request did not complete.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Text copied to clipboard",
      });
    } catch (err) {
      console.error("Failed to copy:", err);
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSeo = (id: string) => {
    const updated = savedSeo.filter((item) => item.id !== id);
    setSavedSeo(updated);
    localStorage.setItem(SEO_STORAGE_KEY, JSON.stringify(updated));
    if (currentSeoId === id) {
      setCurrentSeoId(undefined);
      setSeoResult(null);
    }
  };

  const handleSelectSeo = (item: SavedSeoDescription) => {
    setScriptText(item.script);
    setSeoResult({
      titles: item.titles,
      description: item.description,
      tags: item.tags,
    });
    setCurrentSeoId(item.id);
  };

  const handleSelectScript = (script: SavedScript) => {
    // Prefer the generated script; fall back to outline or original
    const candidate = script.result || script.outline || script.originalArticle;
    setScriptText(candidate || "");
    setCurrentSeoId(undefined);
  };

  const handleDeleteScript = (id: string) => {
    const scriptToDelete = savedScripts.find((s) => s.id === id);
    const wordCountToRemove = scriptToDelete?.wordCount || 0;

    const updatedScripts = savedScripts.filter((script) => script.id !== id);
    setSavedScripts(updatedScripts);
    localStorage.setItem(SCRIPT_STORAGE_KEY, JSON.stringify(updatedScripts));

    if (wordCountToRemove > 0) {
      subtractWordUsage(wordCountToRemove).then((updatedUsage) => {
        if (updatedUsage) {
          setWordUsage(updatedUsage.wordUsage);
        }
      });
    }
  };

  const handleNewDescription = () => {
    setScriptText("");
    setSeoResult(null);
    setCurrentSeoId(undefined);
    setError("");
  };

  const renderTitles = (titles: string[]) => {
    if (!titles?.length) return null;
    return (
      <div className="grid gap-2">
        {titles.map((title, index) => (
          <Card key={index} className="border-muted hover:border-primary/50 hover:bg-primary/5 transition-all">
            <CardContent className="flex items-center justify-between py-3 px-4 gap-3">
              <div className="flex items-center gap-3 text-sm flex-1">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <span className="font-medium leading-tight">{title}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleCopy(title)} 
                className="gap-2 hover:bg-primary/10"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const tagsList = seoResult?.tags
    ? seoResult.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 flex">
      <HistorySidebar
        scripts={savedScripts}
        seoDescriptions={savedSeo}
        onSelect={handleSelectScript}
        onDelete={handleDeleteScript}
        onNewScript={() => navigate("/")}
        onSelectSeo={handleSelectSeo}
        onDeleteSeo={handleDeleteSeo}
        onNewDescription={handleNewDescription}
        wordUsage={wordUsage}
        maxWords={MAX_WORDS}
        currentSeoId={currentSeoId}
      />

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <header className="mb-8 animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold mb-2">YouTube SEO Generator</h1>
              <p className="text-muted-foreground">
                Paste your script and get 5 titles, one optimized description, and comma-separated tags.
              </p>
            </div>
          </header>

          <Card className="mb-6 shadow-lg animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Paste your script
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                We will send your script to OpenAI to craft titles, description, and tags tailored for YouTube.
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="Paste the full YouTube script you want to optimize..."
                className="min-h-[240px] resize-y text-base"
                disabled={isLoading}
              />
              <Button
                onClick={handleGenerateSeo}
                disabled={isLoading}
                className="w-full mt-4 h-12 text-base font-semibold"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Asking OpenAI...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate SEO
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {error && (
            <Card className="mb-6 border-destructive bg-destructive/10">
              <CardContent className="pt-4 pb-4">
                <p className="text-destructive text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {seoResult && !isLoading && (
            <Card className="shadow-xl animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  SEO Output
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCopy(JSON.stringify(seoResult, null, 2))} className="gap-2">
                    <Copy className="h-4 w-4" />
                    Copy All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNewDescription}>
                    New Description
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Wand2 className="h-4 w-4" />
                    <h3 className="text-lg font-semibold">Titles</h3>
                  </div>
                  {renderTitles(seoResult.titles)}
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4" />
                    <h3 className="text-lg font-semibold">Description</h3>
                  </div>
                  <div className="relative group">
                    <Textarea
                      value={seoResult.description}
                      readOnly
                      className="min-h-[180px] text-sm bg-muted/30 focus:bg-muted/40"
                    />
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleCopy(seoResult.description)}
                        title="Copy description text"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Tags className="h-4 w-4" />
                    <h3 className="text-lg font-semibold">Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4 p-3 bg-muted/20 rounded-lg border border-muted">
                    {tagsList.length ? (
                      tagsList.map((tag, idx) => (
                        <Badge 
                          key={`${tag}-${idx}`} 
                          variant="secondary" 
                          className="text-xs cursor-pointer hover:opacity-80"
                          onClick={() => handleCopy(tag)}
                          title="Click to copy this tag"
                        >
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No tags returned</p>
                    )}
                  </div>
                  <div className="relative group">
                    <Textarea
                      value={seoResult.tags}
                      readOnly
                      className="min-h-[80px] text-sm bg-muted/30 focus:bg-muted/40"
                    />
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleCopy(seoResult.tags)}
                        title="Copy all tags as comma-separated list"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </section>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <Card className="border-primary/20 bg-primary/5 animate-pulse-glow">
              <CardContent className="py-6 flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Calling OpenAI for SEO suggestions…</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Seo;
