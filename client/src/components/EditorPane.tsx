import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAutoSave } from "@/hooks/useAutoSave";
import { processWikilinks } from "@/lib/markdownUtils";
import ReactMarkdown from "react-markdown";
import FloatingToolbar from "./FloatingToolbar";
import type { File, Vault } from "@shared/schema";

interface EditorPaneProps {
  file: File | null;
  mode: 'edit' | 'preview' | 'split';
  vault: Vault | null;
  onModeChange: (mode: 'edit' | 'preview' | 'split') => void;
  onNewNote: () => void;
}

export default function EditorPane({ file, mode, vault, onModeChange, onNewNote }: EditorPaneProps) {
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  
  const { save, isSaving, lastSaved } = useAutoSave(file, content);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'e':
            e.preventDefault();
            onModeChange('edit');
            break;
          case 'r':
            e.preventDefault();
            onModeChange('preview');
            break;
          case 'd':
            e.preventDefault();
            onModeChange('split');
            break;
          case 'n':
            e.preventDefault();
            onNewNote();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onModeChange, onNewNote]);

  useEffect(() => {
    if (file) {
      setContent(file.content || "");
      setOriginalContent(file.content || "");
    }
  }, [file]);

  useEffect(() => {
    if (content !== originalContent) {
      save();
    }
  }, [content, originalContent, save]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const processedContent = processWikilinks(content);

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center obsidian-editor">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-lg obsidian-bg flex items-center justify-center">
            <div className="w-12 h-12 bg-obsidian-accent rounded opacity-20"></div>
          </div>
          <h3 className="text-lg font-semibold text-obsidian-text mb-2">
            No file selected
          </h3>
          <p className="text-gray-400 text-sm">
            Choose a file from the explorer or create a new one
          </p>
        </div>
      </div>
    );
  }

  if (mode === 'edit') {
    return (
      <div className="flex-1 obsidian-editor relative">
        <FloatingToolbar
          editorMode={mode}
          onModeChange={onModeChange}
          currentVault={vault}
          onNewNote={onNewNote}
        />
        <div className="h-full p-4">
          <Textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Start writing your note..."
            className="w-full h-full bg-transparent text-obsidian-text font-mono text-sm resize-none border-none outline-none leading-relaxed"
            style={{ 
              minHeight: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              boxShadow: 'none',
            }}
          />
        </div>
      </div>
    );
  }

  if (mode === 'preview') {
    return (
      <div className="flex-1 obsidian-bg relative">
        <FloatingToolbar
          editorMode={mode}
          onModeChange={onModeChange}
          currentVault={vault}
          onNewNote={onNewNote}
        />
        <ScrollArea className="h-full">
          <div className="p-6 max-w-4xl mx-auto prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                a: ({ href, children, ...props }) => {
                  if (href?.startsWith('[[') && href?.endsWith(']]')) {
                    return (
                      <a 
                        href="#" 
                        className="wikilink"
                        {...props}
                      >
                        {children}
                      </a>
                    );
                  }
                  return <a href={href} {...props}>{children}</a>;
                },
                h1: ({ children, ...props }) => (
                  <h1 className="text-2xl font-bold text-obsidian-text mb-4" {...props}>
                    {children}
                  </h1>
                ),
                h2: ({ children, ...props }) => (
                  <h2 className="text-xl font-semibold text-obsidian-text mb-3" {...props}>
                    {children}
                  </h2>
                ),
                h3: ({ children, ...props }) => (
                  <h3 className="text-lg font-semibold text-obsidian-text mb-2" {...props}>
                    {children}
                  </h3>
                ),
                p: ({ children, ...props }) => (
                  <p className="text-obsidian-text mb-4 leading-relaxed" {...props}>
                    {children}
                  </p>
                ),
                ul: ({ children, ...props }) => (
                  <ul className="list-disc list-inside mb-4 text-obsidian-text" {...props}>
                    {children}
                  </ul>
                ),
                ol: ({ children, ...props }) => (
                  <ol className="list-decimal list-inside mb-4 text-obsidian-text" {...props}>
                    {children}
                  </ol>
                ),
                li: ({ children, ...props }) => (
                  <li className="mb-1" {...props}>
                    {children}
                  </li>
                ),
                blockquote: ({ children, ...props }) => (
                  <blockquote className="border-l-4 border-obsidian-accent pl-4 italic text-gray-300 mb-4" {...props}>
                    {children}
                  </blockquote>
                ),
                code: ({ children, ...props }) => (
                  <code className="bg-obsidian-sidebar px-2 py-1 rounded text-sm font-mono text-obsidian-accent" {...props}>
                    {children}
                  </code>
                ),
                pre: ({ children, ...props }) => (
                  <pre className="bg-obsidian-sidebar p-4 rounded-lg mb-4 overflow-x-auto" {...props}>
                    {children}
                  </pre>
                ),
              }}
            >
              {processedContent}
            </ReactMarkdown>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Split mode
  return (
    <div className="flex-1 flex relative">
      <FloatingToolbar
        editorMode={mode}
        onModeChange={onModeChange}
        currentVault={vault}
        onNewNote={onNewNote}
      />
      <div className="flex-1 obsidian-editor border-r border-obsidian-border">
        <div className="h-full p-4">
          <Textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Start writing your note..."
            className="w-full h-full bg-transparent text-obsidian-text font-mono text-sm resize-none border-none outline-none leading-relaxed"
            style={{ 
              minHeight: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              boxShadow: 'none',
            }}
          />
        </div>
      </div>
      
      <div className="flex-1 obsidian-bg">
        <ScrollArea className="h-full">
          <div className="p-6 prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                a: ({ href, children, ...props }) => {
                  if (href?.startsWith('[[') && href?.endsWith(']]')) {
                    return (
                      <a 
                        href="#" 
                        className="wikilink"
                        {...props}
                      >
                        {children}
                      </a>
                    );
                  }
                  return <a href={href} {...props}>{children}</a>;
                },
                h1: ({ children, ...props }) => (
                  <h1 className="text-2xl font-bold text-obsidian-text mb-4" {...props}>
                    {children}
                  </h1>
                ),
                h2: ({ children, ...props }) => (
                  <h2 className="text-xl font-semibold text-obsidian-text mb-3" {...props}>
                    {children}
                  </h2>
                ),
                h3: ({ children, ...props }) => (
                  <h3 className="text-lg font-semibold text-obsidian-text mb-2" {...props}>
                    {children}
                  </h3>
                ),
                p: ({ children, ...props }) => (
                  <p className="text-obsidian-text mb-4 leading-relaxed" {...props}>
                    {children}
                  </p>
                ),
                ul: ({ children, ...props }) => (
                  <ul className="list-disc list-inside mb-4 text-obsidian-text" {...props}>
                    {children}
                  </ul>
                ),
                ol: ({ children, ...props }) => (
                  <ol className="list-decimal list-inside mb-4 text-obsidian-text" {...props}>
                    {children}
                  </ol>
                ),
                li: ({ children, ...props }) => (
                  <li className="mb-1" {...props}>
                    {children}
                  </li>
                ),
                blockquote: ({ children, ...props }) => (
                  <blockquote className="border-l-4 border-obsidian-accent pl-4 italic text-gray-300 mb-4" {...props}>
                    {children}
                  </blockquote>
                ),
                code: ({ children, ...props }) => (
                  <code className="bg-obsidian-sidebar px-2 py-1 rounded text-sm font-mono text-obsidian-accent" {...props}>
                    {children}
                  </code>
                ),
                pre: ({ children, ...props }) => (
                  <pre className="bg-obsidian-sidebar p-4 rounded-lg mb-4 overflow-x-auto" {...props}>
                    {children}
                  </pre>
                ),
              }}
            >
              {processedContent}
            </ReactMarkdown>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
