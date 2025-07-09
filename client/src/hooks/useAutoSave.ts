import { useCallback, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { File } from "@shared/schema";

interface UseAutoSaveReturn {
  save: () => void;
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

export function useAutoSave(
  file: File | null,
  content: string,
  delay: number = 1000
): UseAutoSaveReturn {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<Date | null>(null);
  const originalContentRef = useRef<string>("");
  const isSavingRef = useRef(false);

  const updateMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      if (!file) throw new Error("No file selected");
      
      const response = await apiRequest(
        "PUT",
        `/api/files/${file.id}`,
        data
      );
      return response.json();
    },
    onSuccess: () => {
      lastSavedRef.current = new Date();
      originalContentRef.current = content;
      
      // Update the cache
      queryClient.invalidateQueries({
        queryKey: ['/api/files', file?.id],
      });
      
      if (file) {
        queryClient.invalidateQueries({
          queryKey: ['/api/vaults', file.vaultId, 'files'],
        });
      }
    },
    onError: (error) => {
      console.error("Auto-save failed:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const save = useCallback(() => {
    if (!file || isSavingRef.current) return;
    
    // Clear any pending save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Only save if content has changed
    if (content !== originalContentRef.current) {
      isSavingRef.current = true;
      updateMutation.mutate({ content });
    }
  }, [file, content, updateMutation]);

  const debouncedSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      save();
    }, delay);
  }, [save, delay]);

  useEffect(() => {
    if (file && content !== originalContentRef.current) {
      debouncedSave();
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, debouncedSave, file]);

  useEffect(() => {
    if (file) {
      originalContentRef.current = file.content || "";
    }
  }, [file]);

  useEffect(() => {
    isSavingRef.current = updateMutation.isPending;
  }, [updateMutation.isPending]);

  // Save before unloading
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (content !== originalContentRef.current) {
        event.preventDefault();
        event.returnValue = '';
        save();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [content, save]);

  return {
    save,
    isSaving: updateMutation.isPending,
    lastSaved: lastSavedRef.current,
    hasUnsavedChanges: content !== originalContentRef.current,
  };
}
