# Obsidian Web Vault

## Overview

This is a full-stack web application that replicates the core functionality of Obsidian, a popular note-taking application. The system allows users to create, edit, and manage markdown notes with features like wikilinks, real-time editing, and cloud storage integration through Google Drive.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for development and build processes
- **Styling**: Tailwind CSS with custom Obsidian-themed dark mode
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Style**: REST API with JSON responses

### Key Components

#### Database Layer
- **Schema**: Defined in `shared/schema.ts` with two main tables:
  - `vaults`: Stores vault metadata (name, Google Drive folder ID, connection status)
  - `files`: Stores file content and metadata with hierarchical structure support
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Database schema migrations stored in `./migrations`

#### Storage Layer
- **Interface**: `IStorage` interface in `server/storage.ts` for abstraction
- **Implementation**: In-memory storage for development/testing
- **Operations**: CRUD operations for vaults and files with parent-child relationships

#### API Layer
- **Vault Management**: Create, read, update vaults
- **File Operations**: File CRUD with content management
- **Google Drive Integration**: OAuth authentication and file synchronization

#### Frontend Components
- **Editor**: Split-pane editor with markdown preview and editing modes
- **File Explorer**: Tree-view file browser with expand/collapse functionality
- **Top Bar**: Tab management and editor mode switching
- **Cloud Integration**: Google Drive connection and sync status

## Data Flow

1. **Authentication**: Google OAuth flow for Drive access
2. **Vault Selection**: User selects or creates a vault connected to Google Drive
3. **File Loading**: Files are loaded from database and synced with Google Drive
4. **Real-time Editing**: Auto-save functionality with debounced updates
5. **Wikilink Processing**: Markdown content processed to handle `[[wikilink]]` syntax

## External Dependencies

### Core Dependencies
- **Database**: `@neondatabase/serverless` for PostgreSQL connection
- **ORM**: `drizzle-orm` and `drizzle-zod` for database operations
- **Authentication**: `googleapis` for Google Drive API integration
- **UI**: Comprehensive Radix UI component suite
- **State Management**: `@tanstack/react-query` for server state
- **Markdown**: `react-markdown` for content rendering

### Development Tools
- **Build**: Vite with React plugin and TypeScript support
- **Styling**: Tailwind CSS with PostCSS
- **Code Quality**: TypeScript with strict configuration
- **Development**: Hot reload with Vite dev server

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles Express server to `dist/index.js`
3. **Assets**: Static assets served from build directory

### Environment Configuration
- **Development**: Local development with `tsx` for TypeScript execution
- **Production**: Node.js server serving bundled application
- **Database**: Environment variable `DATABASE_URL` for connection

### File Structure
```
├── client/          # React frontend application
├── server/          # Express backend server
├── shared/          # Shared TypeScript types and schemas
├── migrations/      # Database migration files
└── dist/           # Build output directory
```

### Key Features
- **Auto-save**: Debounced content saving with visual feedback
- **Wikilinks**: `[[link]]` syntax processing for note connections
- **Dark Theme**: Obsidian-inspired dark mode with custom CSS variables
- **Responsive Design**: Mobile-friendly interface with adaptive layouts
- **Cloud Sync**: Google Drive integration for vault storage and synchronization

The application follows a monorepo structure with clear separation between frontend, backend, and shared code, making it maintainable and scalable for future enhancements.