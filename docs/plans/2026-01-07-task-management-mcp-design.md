# Task Management MCP Design

A task management system with MCP integration for Claude Code and a Terminal UI (TUI) for visual task tracking.

## Overview

This system allows users to manage tasks bound to local git repositories. Tasks flow through three statuses (TODO → INPROGRESS → DONE) and can link to Claude's plan and todo files. The MCP server enables Claude Code to manage tasks programmatically, while the TUI provides a kanban-style visual interface.

## Architecture

```
claude-task-manage/
├── packages/
│   ├── core/              # Shared logic
│   │   ├── task.ts        # Task types & validation
│   │   ├── storage.ts     # File-based storage operations
│   │   └── repo.ts        # Git repo detection & hashing
│   ├── mcp/               # MCP server
│   │   ├── server.ts      # MCP server setup
│   │   └── tools/         # Individual MCP tool handlers
│   └── tui/               # Terminal UI
│       ├── app.tsx        # Ink app entry
│       ├── components/    # Kanban board, task card, etc.
│       └── hooks/         # State management
├── package.json           # Monorepo with workspaces
└── tsconfig.json
```

### Key Design Decisions

- **Monorepo with shared core** - Storage and task logic shared between MCP and TUI, ensuring consistency
- **File-based storage** - Single JSON file per repo at `~/.claude-tasks/<repo-hash>/tasks.json`
- **Repo hash** - SHA256 of absolute repo path, ensuring unique storage per repo
- **File locking** - Use `proper-lockfile` to prevent race conditions when MCP and TUI access simultaneously

## Data Model

### Storage Location

```
~/.claude-tasks/
├── index.json              # Maps repo paths to hashes (for lookup)
└── <repo-hash>/
    └── tasks.json
```

### Index File (`index.json`)

```json
{
  "repos": {
    "a1b2c3...": "/Users/sanguk/projects/my-app",
    "d4e5f6...": "/Users/sanguk/projects/other-project"
  }
}
```

### Tasks File (`tasks.json`)

```json
{
  "repoPath": "/Users/sanguk/projects/my-app",
  "tasks": [
    {
      "id": "t_abc123",
      "name": "Build user authentication",
      "description": "Implement JWT-based auth with refresh tokens",
      "status": "INPROGRESS",
      "planPath": "~/.claude/plans/2024-01-07-auth.md",
      "todosPath": "~/.claude/todos/t_abc123.json",
      "createdAt": "2024-01-07T10:00:00Z",
      "updatedAt": "2024-01-07T14:30:00Z"
    }
  ]
}
```

### Task Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique ID with `t_` prefix (nanoid) |
| `name` | string | Yes | Short task name |
| `description` | string | Yes | Detailed description |
| `status` | enum | Yes | `TODO` \| `INPROGRESS` \| `DONE` |
| `planPath` | string | No | Path to linked plan file (`~/.claude/plans/*.md`) |
| `todosPath` | string | No | Path to linked todos file (`~/.claude/todos/*.json`) |
| `createdAt` | ISO string | Yes | Creation timestamp |
| `updatedAt` | ISO string | Yes | Last update timestamp |

## MCP Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `create_task` | `name`, `description` | Creates task with TODO status, returns task ID |
| `list_tasks` | `status?` (optional filter) | Returns all tasks for current repo |
| `get_task` | `id` | Returns full task details |
| `update_task_status` | `id`, `status` | Changes status (TODO/INPROGRESS/DONE) |
| `update_task` | `id`, `name?`, `description?` | Edit task name or description |
| `delete_task` | `id` | Removes task |
| `link_plan` | `id`, `planPath` | Associates a plan file with task |
| `link_todos` | `id`, `todosPath` | Associates a todos file with task |
| `unlink_plan` | `id` | Removes plan association |
| `unlink_todos` | `id` | Removes todos association |

### Repo Detection

MCP server auto-detects current repo from working directory using `git rev-parse --show-toplevel`.

### Error Handling

- Not in a git repo → Clear error message
- Task not found → Return error with available task IDs
- Invalid status transition → Allow any transition (no restrictions)

## TUI Design

### Layout

Full-height kanban board with detail sidebar:

```
┌─ claude-tasks: my-app ───────────────────────────────────────────────────────┐
│ ┌─ TODO (2) ─────┐ ┌─ INPROGRESS (1) ─┐ ┌─ DONE (3) ─────┐ ┌─ Details ─────┐│
│ │                │ │                  │ │                │ │               ││
│ │ ┌────────────┐ │ │ ┌──────────────┐ │ │ ┌────────────┐ │ │ Build user    ││
│ │ │ Setup auth │ │ │ │▶Build user   │ │ │ │ Create     │ │ │ dashboard     ││
│ │ └────────────┘ │ │ │ dashboard    │ │ │ │ schema     │ │ │               ││
│ │ ┌────────────┐ │ │ │ [P] [T 2/5]  │ │ │ └────────────┘ │ │ INPROGRESS    ││
│ │ │ Add tests  │ │ │ └──────────────┘ │ │ ┌────────────┐ │ │ ─────────────  ││
│ │ └────────────┘ │ │                  │ │ │ Init       │ │ │ Implement the ││
│ │                │ │                  │ │ │ project    │ │ │ main dashboard││
│ │                │ │                  │ │ └────────────┘ │ │ with widgets..││
│ │                │ │                  │ │ ┌────────────┐ │ │               ││
│ │                │ │                  │ │ │ Setup CI   │ │ │ ───Plan────── ││
│ │                │ │                  │ │ └────────────┘ │ │ auth.md       ││
│ │                │ │                  │ │                │ │               ││
│ │                │ │                  │ │                │ │ ───Todos 2/5── ││
│ │                │ │                  │ │                │ │ ✓ Setup routes││
│ │                │ │                  │ │                │ │ ✓ Create comps││
│ │                │ │                  │ │                │ │ ○ Add styling ││
│ │                │ │                  │ │                │ │ ○ Write tests ││
│ │                │ │                  │ │                │ │ ○ Docs        ││
│ └────────────────┘ └──────────────────┘ └────────────────┘ └───────────────┘│
│ [n] New  [e] Edit  [←→] Move  [d] Delete  [p] Link Plan  [t] Link Todos  [q]│
└──────────────────────────────────────────────────────────────────────────────┘
```

### Layout Proportions

- Kanban columns: ~70% width (3 equal columns)
- Detail sidebar: ~30% width
- All columns and sidebar stretch to full terminal height

### Task Card Indicators

- `[P]` - Has linked plan
- `[T 2/5]` - Has todos (2 of 5 complete)

### Keyboard Controls

| Key | Action |
|-----|--------|
| `←/→` or `h/l` | Move task between columns |
| `↑/↓` or `j/k` | Navigate tasks within column |
| `Tab` | Switch focus between columns |
| `n` | Create new task (opens form) |
| `e` | Edit selected task |
| `d` | Delete selected task (with confirmation) |
| `p` | Link/unlink plan file |
| `t` | Link/unlink todos file |
| `q` | Quit |

### Detail Sidebar

Shows for selected task:
- Name and status
- Full description
- Linked plan filename (if any)
- Todos list with completion status (reads from linked file)

### File Watching

TUI watches `tasks.json` for changes using `chokidar`, auto-refreshing when MCP modifies tasks.

## Dependencies

| Package | Purpose |
|---------|---------|
| `@modelcontextprotocol/sdk` | MCP server implementation |
| `ink` + `ink-big-text` | React-based TUI framework |
| `react` | Required by Ink |
| `nanoid` | Task ID generation |
| `proper-lockfile` | File locking for concurrent access |
| `chokidar` | File watching for auto-refresh |
| `zod` | Schema validation |

## CLI Interface

### TUI Commands

```bash
# Open TUI for current repo
claude-tasks

# Open TUI for specific repo
claude-tasks --repo /path/to/repo
```

### Quick Actions (for scripting)

```bash
claude-tasks list                        # List tasks as JSON
claude-tasks create "name" "description" # Create task
```

## MCP Registration

Users add to their Claude Code config (`~/.claude.json`):

```json
{
  "mcpServers": {
    "task-manager": {
      "command": "npx",
      "args": ["claude-task-manage"]
    }
  }
}
```
