import { vaults, files, type Vault, type InsertVault, type File, type InsertFile } from "@shared/schema";

export interface IStorage {
  // Vault operations
  getVault(id: number): Promise<Vault | undefined>;
  createVault(vault: InsertVault): Promise<Vault>;
  updateVault(id: number, vault: Partial<InsertVault>): Promise<Vault | undefined>;
  getAllVaults(): Promise<Vault[]>;
  
  // File operations
  getFile(id: number): Promise<File | undefined>;
  getFileByPath(vaultId: number, path: string): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, file: Partial<InsertFile>): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;
  getFilesByVault(vaultId: number): Promise<File[]>;
  getFilesByParent(parentId: number): Promise<File[]>;
}

export class MemStorage implements IStorage {
  private vaults: Map<number, Vault>;
  private files: Map<number, File>;
  private currentVaultId: number;
  private currentFileId: number;

  constructor() {
    this.vaults = new Map();
    this.files = new Map();
    this.currentVaultId = 1;
    this.currentFileId = 1;
    this.initializeDemoData();
  }

  private async initializeDemoData() {
    // Create a demo vault
    const demoVault = await this.createVault({
      name: "Demo Vault",
      folderId: "demo-folder-id",
      isConnected: false,
    });

    // Create some sample files
    await this.createFile({
      vaultId: demoVault.id,
      name: "Welcome.md",
      path: "/Welcome.md",
      content: `# Welcome to Obsidian Web Vault

This is a web-based Obsidian vault editor that connects to your Google Drive to sync your markdown files.

## Features

- **Real-time editing** with live preview
- **Wikilinks** for connecting notes: [[Another Note]]
- **Google Drive sync** for cloud storage
- **Obsidian-style interface** with dark theme
- **Auto-save** functionality

## Getting Started

1. Connect your Google Drive account
2. Select a folder to use as your vault
3. Start editing your notes!

## Wikilinks

You can link to other notes using double brackets: [[Note Name]]

This creates connections between your notes, just like in Obsidian.`,
      isFolder: false,
      driveFileId: null,
      parentId: null,
    });

    await this.createFile({
      vaultId: demoVault.id,
      name: "Another Note.md",
      path: "/Another Note.md",
      content: `# Another Note

This is another note in your vault.

## Backlinks

This note is linked from [[Welcome]].

## More Content

You can write anything here - thoughts, ideas, documentation, or any other content.

### Code Examples

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Lists

- Item 1
- Item 2
- Item 3

### Tasks

- [ ] Todo item
- [x] Completed item`,
      isFolder: false,
      driveFileId: null,
      parentId: null,
    });

    // Create a folder
    const folder = await this.createFile({
      vaultId: demoVault.id,
      name: "Notes",
      path: "/Notes",
      content: "",
      isFolder: true,
      driveFileId: null,
      parentId: null,
    });

    // Create a file inside the folder
    await this.createFile({
      vaultId: demoVault.id,
      name: "Daily Note.md",
      path: "/Notes/Daily Note.md",
      content: `# Daily Note

Today's thoughts and tasks.

## Tasks
- [ ] Review project updates
- [ ] Update documentation  
- [ ] Plan next features

## Notes

This is a note inside the Notes folder.

Connected to: [[Welcome]]`,
      isFolder: false,
      driveFileId: null,
      parentId: folder.id,
    });
  }

  async getVault(id: number): Promise<Vault | undefined> {
    return this.vaults.get(id);
  }

  async createVault(insertVault: InsertVault): Promise<Vault> {
    const id = this.currentVaultId++;
    const vault: Vault = {
      ...insertVault,
      id,
      isConnected: insertVault.isConnected ?? false,
      lastSync: new Date(),
    };
    this.vaults.set(id, vault);
    return vault;
  }

  async updateVault(id: number, vault: Partial<InsertVault>): Promise<Vault | undefined> {
    const existing = this.vaults.get(id);
    if (!existing) return undefined;
    
    const updated: Vault = {
      ...existing,
      ...vault,
      lastSync: new Date(),
    };
    this.vaults.set(id, updated);
    return updated;
  }

  async getAllVaults(): Promise<Vault[]> {
    return Array.from(this.vaults.values());
  }

  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFileByPath(vaultId: number, path: string): Promise<File | undefined> {
    return Array.from(this.files.values()).find(
      (file) => file.vaultId === vaultId && file.path === path
    );
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.currentFileId++;
    const file: File = {
      ...insertFile,
      id,
      vaultId: insertFile.vaultId ?? null,
      content: insertFile.content ?? "",
      driveFileId: insertFile.driveFileId ?? null,
      isFolder: insertFile.isFolder ?? false,
      parentId: insertFile.parentId ?? null,
      lastModified: new Date(),
    };
    this.files.set(id, file);
    return file;
  }

  async updateFile(id: number, file: Partial<InsertFile>): Promise<File | undefined> {
    const existing = this.files.get(id);
    if (!existing) return undefined;
    
    const updated: File = {
      ...existing,
      ...file,
      lastModified: new Date(),
    };
    this.files.set(id, updated);
    return updated;
  }

  async deleteFile(id: number): Promise<boolean> {
    return this.files.delete(id);
  }

  async getFilesByVault(vaultId: number): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      (file) => file.vaultId === vaultId
    );
  }

  async getFilesByParent(parentId: number): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      (file) => file.parentId === parentId
    );
  }
}

export const storage = new MemStorage();
