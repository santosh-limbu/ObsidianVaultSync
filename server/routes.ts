import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVaultSchema, insertFileSchema } from "@shared/schema";
import { google } from "googleapis";

export async function registerRoutes(app: Express): Promise<Server> {
  // Google Drive API setup
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  // Vault routes
  app.get("/api/vaults", async (req, res) => {
    try {
      const vaults = await storage.getAllVaults();
      res.json(vaults);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vaults" });
    }
  });

  app.post("/api/vaults", async (req, res) => {
    try {
      const vaultData = insertVaultSchema.parse(req.body);
      const vault = await storage.createVault(vaultData);
      res.json(vault);
    } catch (error) {
      res.status(400).json({ message: "Invalid vault data" });
    }
  });

  app.put("/api/vaults/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vaultData = insertVaultSchema.partial().parse(req.body);
      const vault = await storage.updateVault(id, vaultData);
      
      if (!vault) {
        return res.status(404).json({ message: "Vault not found" });
      }
      
      res.json(vault);
    } catch (error) {
      res.status(400).json({ message: "Invalid vault data" });
    }
  });

  // File routes
  app.get("/api/vaults/:vaultId/files", async (req, res) => {
    try {
      const vaultId = parseInt(req.params.vaultId);
      const files = await storage.getFilesByVault(vaultId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.get("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const file = await storage.getFile(id);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.json(file);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch file" });
    }
  });

  app.post("/api/files", async (req, res) => {
    try {
      const fileData = insertFileSchema.parse(req.body);
      const file = await storage.createFile(fileData);
      res.json(file);
    } catch (error) {
      res.status(400).json({ message: "Invalid file data" });
    }
  });

  app.put("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const fileData = insertFileSchema.partial().parse(req.body);
      const file = await storage.updateFile(id, fileData);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.json(file);
    } catch (error) {
      res.status(400).json({ message: "Invalid file data" });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFile(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.json({ message: "File deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // Google Drive OAuth routes
  app.get("/api/auth/google", (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.file'],
    });
    res.json({ authUrl });
  });

  app.post("/api/auth/google/callback", async (req, res) => {
    try {
      const { code } = req.body;
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      
      res.json({ success: true, tokens });
    } catch (error) {
      res.status(400).json({ message: "Failed to authenticate with Google" });
    }
  });

  // Google Drive file operations
  app.get("/api/drive/folders", async (req, res) => {
    try {
      const response = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.folder'",
        fields: 'files(id, name, parents)',
      });
      
      res.json(response.data.files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch folders from Google Drive" });
    }
  });

  app.get("/api/drive/files/:folderId", async (req, res) => {
    try {
      const { folderId } = req.params;
      const response = await drive.files.list({
        q: `'${folderId}' in parents`,
        fields: 'files(id, name, mimeType, modifiedTime)',
      });
      
      res.json(response.data.files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch files from Google Drive" });
    }
  });

  app.get("/api/drive/file/:fileId/content", async (req, res) => {
    try {
      const { fileId } = req.params;
      const response = await drive.files.get({
        fileId,
        alt: 'media',
      });
      
      res.json({ content: response.data });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch file content from Google Drive" });
    }
  });

  app.put("/api/drive/file/:fileId/content", async (req, res) => {
    try {
      const { fileId } = req.params;
      const { content } = req.body;
      
      const response = await drive.files.update({
        fileId,
        media: {
          mimeType: 'text/plain',
          body: content,
        },
      });
      
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ message: "Failed to update file content in Google Drive" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
