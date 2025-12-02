import { Sparkles } from "lucide-react";

export const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
        <Sparkles className="h-6 w-6 text-primary" />
        <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-accent animate-pulse" />
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        ScriptGenie
      </span>
    </div>
  );
};
