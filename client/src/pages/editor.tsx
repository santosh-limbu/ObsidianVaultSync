import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import TopBar from "@/components/TopBar";
import FileExplorer from "@/components/FileExplorer";
import EditorPane from "@/components/EditorPane";
import CloudStorageConnection from "@/components/CloudStorageConnection";
import { useGoogleDrive } from "@/hooks/useGoogleDrive";
import type { File, Vault } from "@shared/schema";

export default function Editor() {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentVault, setCurrentVault] = useState<Vault | null>(null);
  const [editorMode, setEditorMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [openTabs, setOpenTabs] = useState<File[]>([]);
  const [showDemo, setShowDemo] = useState(false);
  
  const { isAuthenticated, authenticate } = useGoogleDrive();
  const queryClient = useQueryClient();
  
  const { data: vaults, isLoading: vaultsLoading } = useQuery({
    queryKey: ['/api/vaults'],
    enabled: isAuthenticated || showDemo,
  });

  const { data: files, isLoading: filesLoading } = useQuery({
    queryKey: ['/api/vaults', currentVault?.id, 'files'],
    enabled: !!currentVault,
  });

const createNoteMutation = useMutation({
  mutationFn: async (newNote: { name: string; content: string }) => {
    if (!currentVault) throw new Error('No vault selected');
    return await apiRequest(`/api/files`, {
      method: 'POST',
      body: JSON.stringify({
        vaultId: currentVault.id,
        name: newNote.name,
        content: newNote.content,
        path: `/${newNote.name}`,
        isFolder: false,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  onMutate: async (newNote) => {
    await queryClient.cancelQueries({ queryKey: ['/api/vaults', currentVault?.id, 'files'] });

    const previousFiles = queryClient.getQueryData(['/api/vaults', currentVault?.id, 'files']);

    queryClient.setQueryData(['/api/vaults', currentVault?.id, 'files'], (old: File[] | undefined) => {
      const newFile: File = {
        id: Date.now(), // Temporary ID
        vaultId: currentVault!.id,
        name: newNote.name,
        content: newNote.content,
        path: `/${newNote.name}`,
        isFolder: false,
        parentId: null,
        driveFileId: null,
        lastModified: new Date(),
      };
      return old ? [...old, newFile] : [newFile];
    });

    return { previousFiles };
  },
  onError: (err, newNote, context) => {
    queryClient.setQueryData(['/api/vaults', currentVault?.id, 'files'], context?.previousFiles);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/vaults', currentVault?.id, 'files'] });
  },
  onSuccess: (newFile) => {
    handleFileSelect(newFile);
  },
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

  const handleNewNote = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const noteName = `New Note ${timestamp}.md`;
    const noteContent = `# New Note

Created on ${new Date().toLocaleDateString()}

Start writing your thoughts here...
`;
    
    createNoteMutation.mutate({
      name: noteName,
      content: noteContent,
    });
  };

  useEffect(() => {
    if (vaults && vaults.length > 0 && !currentVault) {
      setCurrentVault(vaults[0]);
    }
  }, [vaults, currentVault]);

  if (!isAuthenticated && !showDemo) {
    return (
      <div className="h-screen flex items-center justify-center obsidian-bg">
        <CloudStorageConnection 
          onConnect={authenticate} 
          onSkip={() => setShowDemo(true)}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col obsidian-bg text-obsidian-text">
      <TopBar
        currentFile={currentFile}
        currentVault={currentVault}
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
          onModeChange={setEditorMode}
          onNewNote={handleNewNote}
          onFileSelect={handleFileSelect}
          files={files || []}
        />
      </div>
    </div>
  );
}
