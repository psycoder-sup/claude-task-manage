# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run build          # Build all packages
npm run test           # Run tests in all packages
npm run dev:tui        # Watch mode for TUI package
npm run dev:mcp        # Watch mode for MCP package
```

Each package has its own `build` and `test` scripts. Run a single package's tests:
```bash
npm run test -w @claude-task-manage/core
```

## Architecture

This is a TypeScript monorepo for a task management system with MCP server integration and Terminal UI.

### Packages

- **core** (`packages/core/`) - Shared business logic: Zod schemas, file-based storage with locking, git repo detection
- **mcp** (`packages/mcp/`) - MCP server exposing 11 tools for task CRUD operations via stdio transport
- **tui** (`packages/tui/`) - Ink-based terminal UI with kanban board layout

### Data Flow

Storage lives at `~/.claude-tasks/<repo-hash>/tasks.json` where repo-hash is SHA256 of the absolute repo path. Both MCP and TUI use the same storage layer from core, with file locking (proper-lockfile) preventing race conditions. TUI watches the storage file with chokidar and auto-refreshes when MCP makes changes.

### Data Model

Tasks have three statuses (TODO → INPROGRESS → DONE) with embedded todos:
- Task IDs: `t_<nanoid>`
- Todo IDs: `td_<nanoid>`
- Plans: optional path to files in `~/.claude/plans/`

### Key Dependencies

- **@modelcontextprotocol/sdk** - MCP server implementation
- **Ink 5.1 + React 18** - Terminal UI framework
- **Zod** - Schema validation
- **proper-lockfile** - File concurrency control
- **chokidar** - File system watcher

## Workflow

Use the task-manager MCP tools for planning and executing plans. This provides persistent task tracking across sessions.
