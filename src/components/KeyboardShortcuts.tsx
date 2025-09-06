import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Keyboard, Search, Plus, Grid3X3, LayoutList, Sun, Moon, Filter } from "lucide-react";

export const KeyboardShortcuts = () => {
  const [open, setOpen] = useState(false);

  const shortcuts = [
    { key: "Ctrl + K", action: "Open search", icon: Search },
    { key: "Ctrl + N", action: "Add new book", icon: Plus },
    { key: "Ctrl + G", action: "Toggle grid view", icon: Grid3X3 },
    { key: "Ctrl + L", action: "Toggle list view", icon: LayoutList },
    { key: "Ctrl + T", action: "Toggle theme", icon: Sun },
    { key: "Ctrl + F", action: "Focus filters", icon: Filter },
    { key: "Escape", action: "Close modals", icon: null },
    { key: "?", action: "Show shortcuts", icon: Keyboard },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl h-10 w-10 p-0 hover:bg-muted"
        >
          <Keyboard className="h-4 w-4" />
          <span className="sr-only">Keyboard shortcuts</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {shortcut.icon && (
                  <shortcut.icon className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">{shortcut.action}</span>
              </div>
              <div className="flex items-center gap-1">
                {shortcut.key.split(" + ").map((key, keyIndex) => (
                  <span key={keyIndex} className="flex items-center gap-1">
                    {keyIndex > 0 && <span className="text-muted-foreground">+</span>}
                    <kbd className="px-2 py-1 text-xs bg-muted rounded border border-border">
                      {key}
                    </kbd>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">?</kbd> to open this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};