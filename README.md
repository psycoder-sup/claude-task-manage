# Claude Task Manager

A task management MCP server with TUI for tracking tasks bound to git repositories.

## Installation

```bash
npm install -g claude-task-manage
```

## Usage

### TUI

```bash
claude-tasks              # Open TUI for current repo
claude-tasks --repo /path # Open TUI for specific repo
```

### MCP Registration

Add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "task-manager": {
      "command": "npx",
      "args": ["@claude-task-manage/mcp"]
    }
  }
}
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `j/k` or arrows | Navigate tasks |
| `h/l` or arrows | Move task between columns |
| `Tab` | Switch columns |
| `Enter` | Select/view task details |
| `n` | Create new task |
| `e` | Edit selected task |
| `d` | Delete selected task |
| `t` | Add todo to selected task |
| `p` | Link plan to selected task |
| `q` | Quit |

## MCP Tools

- `create_task` - Create a new task
- `list_tasks` - List all tasks
- `get_task` - Get task details
- `update_task_status` - Change status (TODO/INPROGRESS/DONE)
- `update_task` - Edit name/description
- `delete_task` - Remove a task
- `link_plan` / `unlink_plan` - Associate plan files
- `add_todo` / `update_todo` / `delete_todo` - Manage embedded todos

## Architecture

TypeScript monorepo with three packages:
- `@claude-task-manage/core` - Shared storage and types
- `@claude-task-manage/mcp` - MCP server
- `@claude-task-manage/tui` - Ink-based terminal UI

Data stored at `~/.claude-tasks/<repo-hash>/tasks.json`
