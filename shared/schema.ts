import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vaults = pgTable("vaults", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  folderId: text("folder_id").notNull(),
  isConnected: boolean("is_connected").default(false),
  lastSync: timestamp("last_sync"),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  vaultId: integer("vault_id").references(() => vaults.id),
  name: text("name").notNull(),
  path: text("path").notNull(),
  content: text("content").default(""),
  driveFileId: text("drive_file_id"),
  isFolder: boolean("is_folder").default(false),
  parentId: integer("parent_id"),
  lastModified: timestamp("last_modified"),
});

export const insertVaultSchema = createInsertSchema(vaults).pick({
  name: true,
  folderId: true,
  isConnected: true,
});

export const insertFileSchema = createInsertSchema(files).pick({
  vaultId: true,
  name: true,
  path: true,
  content: true,
  driveFileId: true,
  isFolder: true,
  parentId: true,
});

export type InsertVault = z.infer<typeof insertVaultSchema>;
export type Vault = typeof vaults.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;
