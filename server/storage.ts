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
  }

  async getVault(id: number): Promise<Vault | undefined> {
    return this.vaults.get(id);
  }

  async createVault(insertVault: InsertVault): Promise<Vault> {
    const id = this.currentVaultId++;
    const vault: Vault = {
      ...insertVault,
      id,
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
