import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Copy, Trash2, ChevronDown, RotateCcw } from "lucide-react";

interface SavedScript {
  id: string;
  originalArticle: string;
  outline: string;
  result: string;
  timestamp: number;
}

interface SavedScriptsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedScripts: SavedScript[];
  onCopy: (text: string) => void;
  onDelete: (id: string) => void;
  onLoad: (script: SavedScript) => void;
}

const SavedScriptsDialog = ({
  open,
  onOpenChange,
  savedScripts,
  onCopy,
  onDelete,
  onLoad,
}: SavedScriptsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Script History ({savedScripts.length})</DialogTitle>
        </DialogHeader>

        {savedScripts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No saved scripts yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Generated scripts will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
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
                            {(script.originalArticle || (script as any).transcript || "").substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onLoad(script)}
                          className="gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Load
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCopy(script.result)}
                          className="gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(script.id)}
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
                        <h4 className="font-semibold mb-2 text-sm">Original Article:</h4>
                        <p className="text-sm text-muted-foreground mb-4 bg-muted/30 p-3 rounded max-h-[150px] overflow-y-auto">
                          {script.originalArticle || (script as any).transcript || "N/A"}
                        </p>
                        {script.outline && (
                          <>
                            <h4 className="font-semibold mb-2 text-sm">Research Outline:</h4>
                            <div className="max-h-[200px] overflow-y-auto bg-muted/30 rounded p-3 mb-4">
                              <pre className="whitespace-pre-wrap font-mono text-xs">
                                {script.outline}
                              </pre>
                            </div>
                          </>
                        )}
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SavedScriptsDialog;
