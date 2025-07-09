import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { googleDriveClient, type GoogleDriveFile, type GoogleDriveFolder } from "@/lib/googleDrive";
import { useToast } from "@/hooks/use-toast";

interface UseGoogleDriveReturn {
  isAuthenticated: boolean;
  authenticate: () => Promise<void>;
  folders: GoogleDriveFolder[];
  files: GoogleDriveFile[];
  getFileContent: (fileId: string) => Promise<string>;
  updateFileContent: (fileId: string, content: string) => Promise<void>;
  createFile: (folderId: string, name: string, content: string) => Promise<GoogleDriveFile>;
  deleteFile: (fileId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useGoogleDrive(): UseGoogleDriveReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: authUrl } = useQuery({
    queryKey: ['/api/auth/google'],
    enabled: !isAuthenticated,
  });

  const { data: folders = [], isLoading: foldersLoading } = useQuery({
    queryKey: ['/api/drive/folders'],
    enabled: isAuthenticated,
  });

  const { data: files = [], isLoading: filesLoading } = useQuery({
    queryKey: ['/api/drive/files'],
    enabled: isAuthenticated,
  });

  const authenticate = async () => {
    try {
      setError(null);
      
      if (!authUrl?.authUrl) {
        throw new Error('No auth URL available');
      }

      // Open OAuth popup
      const popup = window.open(
        authUrl.authUrl,
        'googleAuth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for the callback
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          const { code } = event.data;
          popup?.close();
          
          // Exchange code for tokens
          const response = await fetch('/api/auth/google/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            throw new Error('Failed to authenticate');
          }

          const { tokens } = await response.json();
          setAccessToken(tokens.access_token);
          googleDriveClient.setAccessToken(tokens.access_token);
          setIsAuthenticated(true);
          
          // Store tokens in localStorage for persistence
          localStorage.setItem('googleDriveTokens', JSON.stringify(tokens));
          
          toast({
            title: "Connected to Google Drive",
            description: "You can now access your files and folders.",
          });
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          throw new Error(event.data.error);
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Clean up if popup is closed manually
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getFileContent = async (fileId: string): Promise<string> => {
    try {
      return await googleDriveClient.getFileContent(fileId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch file content';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateFileContent = async (fileId: string, content: string): Promise<void> => {
    try {
      await googleDriveClient.updateFileContent(fileId, content);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update file content';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const createFile = async (folderId: string, name: string, content: string): Promise<GoogleDriveFile> => {
    try {
      return await googleDriveClient.createFile(folderId, name, content);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create file';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteFile = async (fileId: string): Promise<void> => {
    try {
      await googleDriveClient.deleteFile(fileId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete file';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Check for existing tokens on mount
  useEffect(() => {
    const savedTokens = localStorage.getItem('googleDriveTokens');
    if (savedTokens) {
      try {
        const tokens = JSON.parse(savedTokens);
        setAccessToken(tokens.access_token);
        googleDriveClient.setAccessToken(tokens.access_token);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Failed to parse saved tokens:', err);
        localStorage.removeItem('googleDriveTokens');
      }
    }
  }, []);

  return {
    isAuthenticated,
    authenticate,
    folders,
    files,
    getFileContent,
    updateFileContent,
    createFile,
    deleteFile,
    isLoading: foldersLoading || filesLoading,
    error,
  };
}
