import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Edit, Columns, Settings, CheckCircle, Save, X } from "lucide-react";
import { SiGoogledrive } from "react-icons/si";
import type { File, Vault } from "@shared/schema";

interface TopBarProps {
  currentFile: File | null;
  currentVault: Vault | null;
  isConnected: boolean;
  editorMode: 'edit' | 'preview' | 'split';
  onModeChange: (mode: 'edit' | 'preview' | 'split') => void;
  openTabs: File[];
  onTabClose: (fileId: number) => void;
  onTabSelect: (file: File) => void;
}

export default function TopBar({
  currentFile,
  currentVault,
  isConnected,
  editorMode,
  onModeChange,
  openTabs,
  onTabClose,
  onTabSelect,
}: TopBarProps) {
  return (
    <div className="obsidian-sidebar border-b border-obsidian-border">
      {/* Main toolbar */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-obsidian-accent rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-sm"></div>
            </div>
            <h1 className="text-lg font-semibold text-obsidian-text">Obsidian Web Vault</h1>
          </div>
          {currentVault && (
            <div className="text-sm text-gray-400">
              {currentVault.name}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Cloud Storage Status */}
          <div className="flex items-center space-x-2 obsidian-bg px-3 py-1.5 rounded-lg">
            <SiGoogledrive className="text-blue-400 text-sm" />
            <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {/* Save Status */}
          <div className="flex items-center space-x-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400">Saved</span>
          </div>
          
          {/* Actions */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:obsidian-secondary"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* File tabs */}
      {openTabs.length > 0 && (
        <div className="px-4 py-2 border-b border-obsidian-border">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {openTabs.map((tab) => (
              <div
                key={tab.id}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-obsidian-border cursor-pointer ${
                  currentFile?.id === tab.id 
                    ? 'obsidian-bg text-obsidian-accent' 
                    : 'obsidian-sidebar text-obsidian-text hover:obsidian-bg'
                }`}
                onClick={() => onTabSelect(tab)}
              >
                <span className="text-sm whitespace-nowrap">{tab.name}</span>
                <button
                  className="ml-2 text-gray-400 hover:text-obsidian-text transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab.id);
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor controls */}
      {currentFile && (
        <div className="px-4 py-2 flex items-center justify-between border-b border-obsidian-border">
          <div className="flex items-center space-x-4">
            <Tabs value={editorMode} onValueChange={onModeChange}>
              <TabsList className="obsidian-bg">
                <TabsTrigger value="edit" className="text-sm">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="preview" className="text-sm">
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="split" className="text-sm">
                  <Columns className="w-4 h-4 mr-1" />
                  Split
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Lines: 23</span>
            <span>|</span>
            <span>Words: 156</span>
            <span>|</span>
            <span>Characters: 892</span>
          </div>
        </div>
      )}
    </div>
  );
}
