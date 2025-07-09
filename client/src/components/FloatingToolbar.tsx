import { Button } from "@/components/ui/button";
import { 
  Eye, 
  Edit3, 
  Columns, 
  Plus, 
  Settings,
  FileText
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useState } from "react";
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
  const [showSettings, setShowSettings] = useState(false);

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

      {/* Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-obsidian-sidebar border border-obsidian-border text-gray-400 hover:text-white hover:bg-obsidian-bg"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-obsidian-sidebar border-obsidian-border">
          <DropdownMenuItem onClick={onNewNote} className="text-obsidian-text hover:bg-obsidian-bg">
            <FileText className="mr-2 h-4 w-4" />
            New Note
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-obsidian-border" />
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-obsidian-text hover:bg-obsidian-bg">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="bg-obsidian-sidebar border-obsidian-border">
              <DialogHeader>
                <DialogTitle className="text-obsidian-text">Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-obsidian-text">Vault Settings</h4>
                  <div className="text-sm text-gray-400">
                    Current vault: {currentVault?.name || 'No vault selected'}
                  </div>
                  <div className="text-sm text-gray-400">
                    Storage: {currentVault?.folderId === 'demo-folder-id' ? 'Demo Mode' : 'Google Drive'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-obsidian-text">Editor Settings</h4>
                  <div className="text-sm text-gray-400">
                    • Auto-save: Enabled
                  </div>
                  <div className="text-sm text-gray-400">
                    • Wikilinks: Enabled
                  </div>
                  <div className="text-sm text-gray-400">
                    • Theme: Obsidian Dark
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-obsidian-text">Keyboard Shortcuts</h4>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>Ctrl+E: Edit mode</div>
                    <div>Ctrl+R: Preview mode</div>
                    <div>Ctrl+D: Split mode</div>
                    <div>Ctrl+N: New note</div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}