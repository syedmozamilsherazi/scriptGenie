import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Menu, X, ChevronRight, AlertCircle, Sparkles, FileText, PanelsTopLeft, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SavedScript {
  id: string;
  originalArticle: string;
  outline: string;
  result: string;
  timestamp: number;
  wordCount?: number;
}

interface SavedSeoDescription {
  id: string;
  script: string;
  titles: string[];
  description: string;
  tags: string;
  timestamp: number;
}

interface HistorySidebarProps {
  scripts: SavedScript[];
  seoDescriptions?: SavedSeoDescription[];
  onSelect: (script: SavedScript) => void;
  onDelete: (id: string) => void;
  onNewScript: () => void;
  onSelectSeo?: (item: SavedSeoDescription) => void;
  onDeleteSeo?: (id: string) => void;
  onNewDescription?: () => void;
  wordUsage: number;
  maxWords: number;
  currentScriptId?: string;
  currentSeoId?: string;
}

const HistorySidebar = ({
  scripts,
  seoDescriptions = [],
  onSelect,
  onDelete,
  onNewScript,
  onSelectSeo,
  onDeleteSeo,
  onNewDescription,
  wordUsage,
  maxWords,
  currentScriptId,
  currentSeoId,
}: HistorySidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "script" | "seo">("all");

  const isLimitReached = wordUsage >= maxWords;

  const getScriptTitle = (script: SavedScript) => {
    const article = script.originalArticle || (script as any).transcript || "";
    return article.substring(0, 40) + (article.length > 40 ? "..." : "");
  };

  const getSeoTitle = (item: SavedSeoDescription) => {
    if (item.titles?.length) return item.titles[0];
    return item.description.substring(0, 50) + (item.description.length > 50 ? "..." : "");
  };

  const mergedItems = [...scripts.map((s) => ({ type: "script" as const, timestamp: s.timestamp, item: s })), ...seoDescriptions.map((s) => ({ type: "seo" as const, timestamp: s.timestamp, item: s }))]
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter((entry) => {
      if (activeTab === "all") return true;
      return entry.type === activeTab;
    });

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNewScriptClick = () => {
    if (isLimitReached) {
      setShowLimitDialog(true);
    } else {
      onNewScript();
    }
  };

  const getNextResetDate = () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    return nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-40 md:hidden"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-background border-r border-border flex flex-col z-40 transition-transform md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full gap-2" variant="default">
                <Wrench className="h-4 w-4" />
                Tools
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem
                onClick={handleNewScriptClick}
                disabled={isLimitReached}
                className="gap-2 cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                Script Generator
              </DropdownMenuItem>
              {onNewDescription && (
                <DropdownMenuItem
                  onClick={() => onNewDescription()}
                  className="gap-2 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  YouTube SEO Generator
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* History filter tabs */}
        <div className="px-4 py-3 border-b border-border overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <Button
              variant={activeTab === "all" ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => setActiveTab("all")}
            >
              <PanelsTopLeft className="h-4 w-4" />
              <span className="sr-only">All history</span>
            </Button>
            <Button
              variant={activeTab === "script" ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => setActiveTab("script")}
            >
              <FileText className="h-4 w-4" />
              <span className="sr-only">Scripts</span>
            </Button>
            <Button
              variant={activeTab === "seo" ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => setActiveTab("seo")}
            >
              <Sparkles className="h-4 w-4" />
              <span className="sr-only">SEO</span>
            </Button>
          </div>
        </div>

        {/* Word Limit Indicator */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Monthly Limit</span>
            <span className="text-xs text-muted-foreground">
              {wordUsage.toLocaleString()} / {maxWords.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                (wordUsage / maxWords) < 0.7
                  ? "bg-primary"
                  : (wordUsage / maxWords) < 0.9
                  ? "bg-yellow-500"
                  : "bg-red-500"
              )}
              style={{ width: `${Math.min((wordUsage / maxWords) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round((wordUsage / maxWords) * 100)}% used
            {isLimitReached && (
              <span className="block text-red-500 font-medium mt-1">
                Limit reached • Resets {getNextResetDate()}
              </span>
            )}
          </p>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto">
          {mergedItems.length === 0 ? (
            <div className="px-4 py-6 text-muted-foreground text-sm">
              <p>No history yet</p>
              <p className="text-xs mt-2">Generate content to see it here</p>
            </div>
          ) : (
            <nav className="space-y-1 p-2">
              {mergedItems.map(({ type, item }) => {
                const isActive = type === "script" ? currentScriptId === item.id : currentSeoId === item.id;
                const title = type === "script" ? getScriptTitle(item as SavedScript) : getSeoTitle(item as SavedSeoDescription);
                const onSelectItem = () => {
                  if (type === "script") {
                    onSelect(item as SavedScript);
                  } else {
                    onSelectSeo?.(item as SavedSeoDescription);
                  }
                  setIsOpen(false);
                };
                const onDeleteItem = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (type === "script") {
                    onDelete(item.id);
                  } else {
                    onDeleteSeo?.(item.id);
                  }
                };

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "group relative rounded-lg transition-colors hover:bg-muted",
                      isActive && "bg-primary/10"
                    )}
                  >
                    <button
                      onClick={onSelectItem}
                      className="w-full text-left px-3 py-2 text-sm truncate flex items-center gap-2"
                    >
                      {type === "script" ? (
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className="truncate flex-1">{title}</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    </button>
                    <div className="hidden group-hover:flex absolute right-2 top-1/2 -translate-y-1/2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={onDeleteItem}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="px-3 text-xs text-muted-foreground pb-2">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </nav>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 text-xs text-muted-foreground">
          <p>ScriptGenie v1.0</p>
        </div>
      </aside>

      {/* Main Content Spacer */}
      <div className="hidden md:block md:w-64" />

      {/* Limit Reached Dialog */}
      <AlertDialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Monthly Limit Reached
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You have exhausted your <span className="font-semibold">{maxWords.toLocaleString()} word limit</span> for this month.
              </p>
              <p>
                Your limit will automatically reset on <span className="font-semibold">{getNextResetDate()}</span>.
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Current usage: {wordUsage.toLocaleString()} / {maxWords.toLocaleString()} words
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setShowLimitDialog(false)}>
              Okay
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default HistorySidebar;
