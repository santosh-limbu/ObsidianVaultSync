import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  Plus, 
  Search, 
  RefreshCw,
  ChevronRight,
  ChevronDown 
} from "lucide-react";
import type { File, Vault } from "@shared/schema";

interface FileExplorerProps {
  vault: Vault | null;
  files: File[];
  onFileSelect: (file: File) => void;
  onVaultSelect: (vault: Vault) => void;
  currentFile: File | null;
  isLoading: boolean;
}

interface FileTreeNode {
  file: File;
  children: FileTreeNode[];
  isExpanded: boolean;
}

export default function FileExplorer({
  vault,
  files,
  onFileSelect,
  currentFile,
  isLoading,
}: FileExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());

  const buildFileTree = (files: File[]): FileTreeNode[] => {
    const rootFiles = files.filter(file => !file.parentId);
    
    const buildNode = (file: File): FileTreeNode => {
      const children = files
        .filter(f => f.parentId === file.id)
        .map(buildNode);
      
      return {
        file,
        children,
        isExpanded: expandedFolders.has(file.id),
      };
    };

    return rootFiles.map(buildNode);
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fileTree = buildFileTree(searchQuery ? filteredFiles : files);

  const toggleFolder = (folderId: number) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const renderFileNode = (node: FileTreeNode, depth: number = 0) => {
    const { file, children, isExpanded } = node;
    const isCurrentFile = currentFile?.id === file.id;
    
    return (
      <div key={file.id}>
        <div
          className={`flex items-center space-x-2 cursor-pointer hover:obsidian-bg rounded-lg px-2 py-1 transition-colors group ${
            isCurrentFile ? 'obsidian-bg text-obsidian-accent' : 'text-obsidian-text'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (file.isFolder) {
              toggleFolder(file.id);
            } else {
              onFileSelect(file);
            }
          }}
        >
          {file.isFolder && (
            <button className="p-0.5">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          )}
          
          {file.isFolder ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-obsidian-accent" />
            ) : (
              <Folder className="w-4 h-4 text-obsidian-accent" />
            )
          ) : (
            <FileText className="w-4 h-4 text-gray-400" />
          )}
          
          <span className={`text-sm ${isCurrentFile ? 'text-obsidian-accent' : 'text-obsidian-text group-hover:text-obsidian-accent'} transition-colors`}>
            {file.name}
          </span>
        </div>
        
        {file.isFolder && isExpanded && children.length > 0 && (
          <div>
            {children.map(child => renderFileNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-80 obsidian-sidebar border-r border-obsidian-border flex flex-col">
      {/* Vault info */}
      <div className="p-4 border-b border-obsidian-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-obsidian-text">
            {vault ? vault.name : 'No Vault Selected'}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:obsidian-bg"
            disabled={isLoading}
          >
            <RefreshCw className={`w-3 h-3 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="obsidian-bg border-obsidian-border rounded-lg px-3 py-2 pl-9 text-sm focus:outline-none focus:border-obsidian-accent"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>
      
      {/* File tree */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : fileTree.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No files found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {fileTree.map(node => renderFileNode(node))}
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Quick actions */}
      <div className="p-4 border-t border-obsidian-border">
        <Button
          className="w-full obsidian-bg hover:obsidian-secondary transition-colors px-4 py-2 rounded-lg flex items-center justify-center space-x-2 text-sm"
          disabled={!vault}
        >
          <Plus className="w-4 h-4 text-obsidian-accent" />
          <span>New Note</span>
        </Button>
      </div>
    </div>
  );
}
