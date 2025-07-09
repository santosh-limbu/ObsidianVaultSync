import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import TopBar from "@/components/TopBar";
import FileExplorer from "@/components/FileExplorer";
import EditorPane from "@/components/EditorPane";
import CloudStorageConnection from "@/components/CloudStorageConnection";
import { useGoogleDrive } from "@/hooks/useGoogleDrive";
import type { File, Vault } from "@shared/schema";

export default function Editor() {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentVault, setCurrentVault] = useState<Vault | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [editorMode, setEditorMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [openTabs, setOpenTabs] = useState<File[]>([]);
  
  const { isAuthenticated, authenticate } = useGoogleDrive();
  
  const { data: vaults, isLoading: vaultsLoading } = useQuery({
    queryKey: ['/api/vaults'],
    enabled: isAuthenticated,
  });

  const { data: files, isLoading: filesLoading } = useQuery({
    queryKey: ['/api/vaults', currentVault?.id, 'files'],
    enabled: !!currentVault,
  });

  const handleFileSelect = (file: File) => {
    setCurrentFile(file);
    
    // Add to open tabs if not already open
    if (!openTabs.find(tab => tab.id === file.id)) {
      setOpenTabs(prev => [...prev, file]);
    }
  };

  const handleTabClose = (fileId: number) => {
    setOpenTabs(prev => prev.filter(tab => tab.id !== fileId));
    
    // If closing current file, switch to another tab or clear
    if (currentFile?.id === fileId) {
      const remainingTabs = openTabs.filter(tab => tab.id !== fileId);
      setCurrentFile(remainingTabs.length > 0 ? remainingTabs[0] : null);
    }
  };

  const handleVaultSelect = (vault: Vault) => {
    setCurrentVault(vault);
    setCurrentFile(null);
    setOpenTabs([]);
  };

  useEffect(() => {
    if (vaults && vaults.length > 0 && !currentVault) {
      setCurrentVault(vaults[0]);
    }
  }, [vaults, currentVault]);

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center obsidian-bg">
        <CloudStorageConnection onConnect={authenticate} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col obsidian-bg text-obsidian-text">
      <TopBar
        currentFile={currentFile}
        currentVault={currentVault}
        editorMode={editorMode}
        onModeChange={setEditorMode}
        openTabs={openTabs}
        onTabClose={handleTabClose}
        onTabSelect={handleFileSelect}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <FileExplorer
          vault={currentVault}
          files={files || []}
          onFileSelect={handleFileSelect}
          onVaultSelect={handleVaultSelect}
          currentFile={currentFile}
          isLoading={filesLoading}
        />
        
        <EditorPane
          file={currentFile}
          mode={editorMode}
          vault={currentVault}
        />
      </div>
    </div>
  );
}
