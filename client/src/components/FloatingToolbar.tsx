import { Button } from "@/components/ui/button";
import { 
  Eye, 
  Edit3, 
  Columns
} from "lucide-react";
import type { Vault } from "@shared/schema";

interface FloatingToolbarProps {
  editorMode: 'edit' | 'preview' | 'split';
  onModeChange: (mode: 'edit' | 'preview' | 'split') => void;
  currentVault: Vault | null;
  onNewNote: () => void;
}

export default function FloatingToolbar({ 
  editorMode, 
  onModeChange, 
  currentVault, 
  onNewNote 
}: FloatingToolbarProps) {

  const modeButtons = [
    { mode: 'edit' as const, icon: Edit3, label: 'Edit' },
    { mode: 'preview' as const, icon: Eye, label: 'Preview' },
    { mode: 'split' as const, icon: Columns, label: 'Split' },
  ];

  return (
    <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
      {/* View Mode Buttons */}
      <div className="flex items-center bg-obsidian-sidebar border border-obsidian-border rounded-lg p-1">
        {modeButtons.map(({ mode, icon: Icon, label }) => (
          <Button
            key={mode}
            variant={editorMode === mode ? "default" : "ghost"}
            size="sm"
            onClick={() => onModeChange(mode)}
            className={`h-8 w-8 p-0 ${
              editorMode === mode 
                ? 'bg-obsidian-accent text-white' 
                : 'text-gray-400 hover:text-white hover:bg-obsidian-bg'
            }`}
            title={label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      
    </div>
  );
}