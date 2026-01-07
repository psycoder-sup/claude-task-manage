# Task Management MCP Implementation Plan [Done]

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a task management MCP server with TUI that tracks tasks bound to git repositories, integrating with Claude Code's planning workflow.

## Progress
- [x] Task 1: Project Setup
- [x] Task 2: Core Types and Schemas
- [x] Task 3: Repository Detection
- [x] Task 4: Storage Layer
- [x] Task 5: MCP Server
- [x] Task 6: TUI - Basic App Structure
- [x] Task 7: TUI - Create/Edit Task Forms
- [x] Task 8: TUI - Add Todo Form
- [x] Task 9: TUI - Link Plan Picker
- [x] Task 10: Final Polish

**Architecture:** TypeScript monorepo with three packages: `core` (shared storage/types), `mcp` (MCP server), and `tui` (Ink-based terminal UI). File-based storage at `~/.claude-tasks/<repo-hash>/`.

**Tech Stack:** TypeScript, Node.js, @modelcontextprotocol/sdk, Ink (React TUI), Zod, nanoid, proper-lockfile, chokidar

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.base.json`
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/mcp/package.json`
- Create: `packages/mcp/tsconfig.json`
- Create: `packages/tui/package.json`
- Create: `packages/tui/tsconfig.json`

**Step 1: Create root package.json**

```json
{
  "name": "claude-task-manage",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces --if-present",
    "dev:tui": "npm run dev -w @claude-task-manage/tui",
    "dev:mcp": "npm run dev -w @claude-task-manage/mcp"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.7.0"
  }
}
```

**Step 2: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

**Step 3: Create root tsconfig.json**

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@claude-task-manage/core": ["packages/core/src"],
      "@claude-task-manage/mcp": ["packages/mcp/src"],
      "@claude-task-manage/tui": ["packages/tui/src"]
    }
  },
  "references": [
    { "path": "packages/core" },
    { "path": "packages/mcp" },
    { "path": "packages/tui" }
  ]
}
```

**Step 4: Create packages/core/package.json**

```json
{
  "name": "@claude-task-manage/core",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "nanoid": "^5.0.0",
    "proper-lockfile": "^4.1.2",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/proper-lockfile": "^4.1.4",
    "vitest": "^2.0.0"
  }
}
```

**Step 5: Create packages/core/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src/**/*"]
}
```

**Step 6: Create packages/mcp/package.json**

```json
{
  "name": "@claude-task-manage/mcp",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "claude-task-mcp": "./dist/index.js"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@claude-task-manage/core": "*",
    "@modelcontextprotocol/sdk": "^1.0.0"
  }
}
```

**Step 7: Create packages/mcp/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../core" }
  ]
}
```

**Step 8: Create packages/tui/package.json**

```json
{
  "name": "@claude-task-manage/tui",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "claude-tasks": "./dist/index.js"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@claude-task-manage/core": "*",
    "chokidar": "^4.0.0",
    "ink": "^5.1.0",
    "ink-text-input": "^6.0.0",
    "react": "^18.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0"
  }
}
```

**Step 9: Create packages/tui/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true,
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../core" }
  ]
}
```

**Step 10: Create directory structure and install**

```bash
mkdir -p packages/core/src packages/mcp/src packages/tui/src
npm install
```

**Step 11: Commit**

```bash
git add -A
git commit -m "chore: initialize monorepo structure with core, mcp, and tui packages"
```

---

## Task 2: Core Types and Schemas

**Files:**
- Create: `packages/core/src/types.ts`
- Create: `packages/core/src/index.ts`
- Test: `packages/core/src/types.test.ts`

**Step 1: Write the failing test for task schema validation**

```typescript
// packages/core/src/types.test.ts
import { describe, it, expect } from 'vitest';
import { TaskSchema, TodoSchema } from './types.js';

describe('TodoSchema', () => {
  it('validates a complete todo', () => {
    const todo = {
      id: 'td_abc123',
      content: 'Setup routes',
      completed: false,
    };

    const result = TodoSchema.safeParse(todo);
    expect(result.success).toBe(true);
  });

  it('rejects todo without content', () => {
    const todo = {
      id: 'td_abc123',
      completed: false,
    };

    const result = TodoSchema.safeParse(todo);
    expect(result.success).toBe(false);
  });
});

describe('TaskSchema', () => {
  it('validates a complete task with todos', () => {
    const task = {
      id: 't_abc123',
      name: 'Test task',
      description: 'A test task description',
      status: 'TODO',
      todos: [
        { id: 'td_1', content: 'First item', completed: false },
      ],
      createdAt: '2024-01-07T10:00:00Z',
      updatedAt: '2024-01-07T10:00:00Z',
    };

    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(true);
  });

  it('validates task with optional planPath', () => {
    const task = {
      id: 't_abc123',
      name: 'Test task',
      description: 'A test task description',
      status: 'INPROGRESS',
      planPath: '~/.claude/plans/test.md',
      todos: [],
      createdAt: '2024-01-07T10:00:00Z',
      updatedAt: '2024-01-07T10:00:00Z',
    };

    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(true);
  });

  it('rejects task with invalid status', () => {
    const task = {
      id: 't_abc123',
      name: 'Test task',
      description: 'A test task description',
      status: 'INVALID',
      todos: [],
      createdAt: '2024-01-07T10:00:00Z',
      updatedAt: '2024-01-07T10:00:00Z',
    };

    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(false);
  });

  it('rejects task without required description', () => {
    const task = {
      id: 't_abc123',
      name: 'Test task',
      status: 'TODO',
      todos: [],
      createdAt: '2024-01-07T10:00:00Z',
      updatedAt: '2024-01-07T10:00:00Z',
    };

    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -w @claude-task-manage/core`
Expected: FAIL with "Cannot find module './types.js'"

**Step 3: Write types implementation**

```typescript
// packages/core/src/types.ts
import { z } from 'zod';

export const TaskStatus = z.enum(['TODO', 'INPROGRESS', 'DONE']);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const TodoSchema = z.object({
  id: z.string().startsWith('td_'),
  content: z.string().min(1),
  completed: z.boolean(),
});

export type Todo = z.infer<typeof TodoSchema>;

export const TaskSchema = z.object({
  id: z.string().startsWith('t_'),
  name: z.string().min(1),
  description: z.string().min(1),
  status: TaskStatus,
  planPath: z.string().optional(),
  todos: z.array(TodoSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Task = z.infer<typeof TaskSchema>;

export const TasksFileSchema = z.object({
  repoPath: z.string(),
  tasks: z.array(TaskSchema),
});

export type TasksFile = z.infer<typeof TasksFileSchema>;

export const IndexFileSchema = z.object({
  repos: z.record(z.string(), z.string()),
});

export type IndexFile = z.infer<typeof IndexFileSchema>;
```

**Step 4: Create index.ts to export types**

```typescript
// packages/core/src/index.ts
export * from './types.js';
```

**Step 5: Run test to verify it passes**

Run: `npm test -w @claude-task-manage/core`
Expected: PASS (5 tests)

**Step 6: Commit**

```bash
git add -A
git commit -m "feat(core): add task and todo types with zod schemas"
```

---

## Task 3: Repository Detection

**Files:**
- Create: `packages/core/src/repo.ts`
- Modify: `packages/core/src/index.ts`
- Test: `packages/core/src/repo.test.ts`

**Step 1: Write the failing test for repo detection**

```typescript
// packages/core/src/repo.test.ts
import { describe, it, expect } from 'vitest';
import { getRepoRoot, getRepoHash } from './repo.js';

describe('getRepoRoot', () => {
  it('returns the git root directory', async () => {
    const result = await getRepoRoot();
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('returns null for non-git directory', async () => {
    const result = await getRepoRoot('/tmp');
    expect(result).toBeNull();
  });
});

describe('getRepoHash', () => {
  it('returns consistent hash for same path', () => {
    const hash1 = getRepoHash('/some/repo/path');
    const hash2 = getRepoHash('/some/repo/path');
    expect(hash1).toBe(hash2);
  });

  it('returns different hashes for different paths', () => {
    const hash1 = getRepoHash('/some/repo/path');
    const hash2 = getRepoHash('/other/repo/path');
    expect(hash1).not.toBe(hash2);
  });

  it('returns a sha256 hash', () => {
    const hash = getRepoHash('/some/repo/path');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -w @claude-task-manage/core`
Expected: FAIL with "Cannot find module './repo.js'"

**Step 3: Write repo implementation**

```typescript
// packages/core/src/repo.ts
import { execSync } from 'child_process';
import * as crypto from 'crypto';

export async function getRepoRoot(cwd?: string): Promise<string | null> {
  try {
    const result = execSync('git rev-parse --show-toplevel', {
      cwd: cwd || process.cwd(),
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return result.trim();
  } catch {
    return null;
  }
}

export function getRepoHash(repoPath: string): string {
  return crypto.createHash('sha256').update(repoPath).digest('hex');
}
```

**Step 4: Update index.ts**

```typescript
// packages/core/src/index.ts
export * from './types.js';
export * from './repo.js';
```

**Step 5: Run test to verify it passes**

Run: `npm test -w @claude-task-manage/core`
Expected: PASS (all tests)

**Step 6: Commit**

```bash
git add -A
git commit -m "feat(core): add git repository detection and hashing"
```

---

## Task 4: Storage Layer

**Files:**
- Create: `packages/core/src/storage.ts`
- Modify: `packages/core/src/index.ts`
- Test: `packages/core/src/storage.test.ts`

**Step 1: Write the failing test for storage**

```typescript
// packages/core/src/storage.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TaskStorage } from './storage.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('TaskStorage', () => {
  let tempDir: string;
  let storage: TaskStorage;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'claude-tasks-test-'));
    storage = new TaskStorage(tempDir);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('initRepo', () => {
    it('creates tasks file for a new repo', async () => {
      const repoPath = '/test/repo';
      await storage.initRepo(repoPath);

      const tasks = await storage.getTasks(repoPath);
      expect(tasks).toEqual([]);
    });

    it('updates index file with repo mapping', async () => {
      const repoPath = '/test/repo';
      await storage.initRepo(repoPath);

      const index = await storage.getIndex();
      expect(Object.values(index.repos)).toContain(repoPath);
    });
  });

  describe('createTask', () => {
    it('creates a new task with TODO status and empty todos', async () => {
      const repoPath = '/test/repo';
      await storage.initRepo(repoPath);

      const task = await storage.createTask(repoPath, {
        name: 'Test task',
        description: 'A test description',
      });

      expect(task.id).toMatch(/^t_/);
      expect(task.name).toBe('Test task');
      expect(task.description).toBe('A test description');
      expect(task.status).toBe('TODO');
      expect(task.todos).toEqual([]);
    });
  });

  describe('updateTaskStatus', () => {
    it('updates task status', async () => {
      const repoPath = '/test/repo';
      await storage.initRepo(repoPath);
      const task = await storage.createTask(repoPath, {
        name: 'Test task',
        description: 'A test description',
      });

      const updated = await storage.updateTaskStatus(repoPath, task.id, 'INPROGRESS');

      expect(updated.status).toBe('INPROGRESS');
      expect(updated.updatedAt).not.toBe(task.updatedAt);
    });
  });

  describe('getTasks', () => {
    it('returns all tasks for a repo', async () => {
      const repoPath = '/test/repo';
      await storage.initRepo(repoPath);
      await storage.createTask(repoPath, { name: 'Task 1', description: 'Desc 1' });
      await storage.createTask(repoPath, { name: 'Task 2', description: 'Desc 2' });

      const tasks = await storage.getTasks(repoPath);
      expect(tasks).toHaveLength(2);
    });

    it('filters tasks by status', async () => {
      const repoPath = '/test/repo';
      await storage.initRepo(repoPath);
      const task1 = await storage.createTask(repoPath, { name: 'Task 1', description: 'Desc 1' });
      await storage.createTask(repoPath, { name: 'Task 2', description: 'Desc 2' });
      await storage.updateTaskStatus(repoPath, task1.id, 'DONE');

      const doneTasks = await storage.getTasks(repoPath, 'DONE');
      expect(doneTasks).toHaveLength(1);
      expect(doneTasks[0].name).toBe('Task 1');
    });
  });

  describe('deleteTask', () => {
    it('removes a task', async () => {
      const repoPath = '/test/repo';
      await storage.initRepo(repoPath);
      const task = await storage.createTask(repoPath, { name: 'Test', description: 'Desc' });

      await storage.deleteTask(repoPath, task.id);

      const tasks = await storage.getTasks(repoPath);
      expect(tasks).toHaveLength(0);
    });
  });

  describe('linkPlan', () => {
    it('associates a plan path with a task', async () => {
      const repoPath = '/test/repo';
      await storage.initRepo(repoPath);
      const task = await storage.createTask(repoPath, { name: 'Test', description: 'Desc' });

      const updated = await storage.linkPlan(repoPath, task.id, '~/.claude/plans/test.md');

      expect(updated.planPath).toBe('~/.claude/plans/test.md');
    });
  });

  describe('addTodo', () => {
    it('adds a todo to a task', async () => {
      const repoPath = '/test/repo';
      await storage.initRepo(repoPath);
      const task = await storage.createTask(repoPath, { name: 'Test', description: 'Desc' });

      const updated = await storage.addTodo(repoPath, task.id, 'First todo item');

      expect(updated.todos).toHaveLength(1);
      expect(updated.todos[0].content).toBe('First todo item');
      expect(updated.todos[0].completed).toBe(false);
      expect(updated.todos[0].id).toMatch(/^td_/);
    });
  });

  describe('updateTodo', () => {
    it('toggles todo completion', async () => {
      const repoPath = '/test/repo';
      await storage.initRepo(repoPath);
      const task = await storage.createTask(repoPath, { name: 'Test', description: 'Desc' });
      const withTodo = await storage.addTodo(repoPath, task.id, 'First todo');

      const updated = await storage.updateTodo(repoPath, task.id, withTodo.todos[0].id, true);

      expect(updated.todos[0].completed).toBe(true);
    });
  });

  describe('deleteTodo', () => {
    it('removes a todo from a task', async () => {
      const repoPath = '/test/repo';
      await storage.initRepo(repoPath);
      const task = await storage.createTask(repoPath, { name: 'Test', description: 'Desc' });
      const withTodo = await storage.addTodo(repoPath, task.id, 'First todo');

      const updated = await storage.deleteTodo(repoPath, task.id, withTodo.todos[0].id);

      expect(updated.todos).toHaveLength(0);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -w @claude-task-manage/core`
Expected: FAIL with "Cannot find module './storage.js'"

**Step 3: Write storage implementation**

```typescript
// packages/core/src/storage.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import { nanoid } from 'nanoid';
import lockfile from 'proper-lockfile';
import { Task, TaskStatus, Todo, TasksFile, IndexFile, TasksFileSchema, IndexFileSchema } from './types.js';
import { getRepoHash } from './repo.js';

export interface CreateTaskInput {
  name: string;
  description: string;
}

export interface UpdateTaskInput {
  name?: string;
  description?: string;
}

export class TaskStorage {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.join(process.env.HOME || '~', '.claude-tasks');
  }

  private async ensureDir(dir: string): Promise<void> {
    await fs.mkdir(dir, { recursive: true });
  }

  private getIndexPath(): string {
    return path.join(this.baseDir, 'index.json');
  }

  private getTasksDir(repoPath: string): string {
    const hash = getRepoHash(repoPath);
    return path.join(this.baseDir, hash);
  }

  private getTasksPath(repoPath: string): string {
    return path.join(this.getTasksDir(repoPath), 'tasks.json');
  }

  async getIndex(): Promise<IndexFile> {
    try {
      const content = await fs.readFile(this.getIndexPath(), 'utf-8');
      return IndexFileSchema.parse(JSON.parse(content));
    } catch {
      return { repos: {} };
    }
  }

  private async saveIndex(index: IndexFile): Promise<void> {
    await this.ensureDir(this.baseDir);
    await fs.writeFile(this.getIndexPath(), JSON.stringify(index, null, 2));
  }

  async initRepo(repoPath: string): Promise<void> {
    const hash = getRepoHash(repoPath);
    const tasksDir = this.getTasksDir(repoPath);
    const tasksPath = this.getTasksPath(repoPath);

    await this.ensureDir(tasksDir);

    try {
      await fs.access(tasksPath);
    } catch {
      const tasksFile: TasksFile = { repoPath, tasks: [] };
      await fs.writeFile(tasksPath, JSON.stringify(tasksFile, null, 2));
    }

    const index = await this.getIndex();
    index.repos[hash] = repoPath;
    await this.saveIndex(index);
  }

  private async readTasksFile(repoPath: string): Promise<TasksFile> {
    const tasksPath = this.getTasksPath(repoPath);
    try {
      const content = await fs.readFile(tasksPath, 'utf-8');
      return TasksFileSchema.parse(JSON.parse(content));
    } catch {
      return { repoPath, tasks: [] };
    }
  }

  private async writeTasksFile(repoPath: string, tasksFile: TasksFile): Promise<void> {
    const tasksPath = this.getTasksPath(repoPath);
    const tasksDir = path.dirname(tasksPath);
    await this.ensureDir(tasksDir);
    await fs.writeFile(tasksPath, JSON.stringify(tasksFile, null, 2));
  }

  private async withLock<T>(repoPath: string, fn: () => Promise<T>): Promise<T> {
    const tasksPath = this.getTasksPath(repoPath);
    const tasksDir = path.dirname(tasksPath);
    await this.ensureDir(tasksDir);

    try {
      await fs.access(tasksPath);
    } catch {
      await fs.writeFile(tasksPath, JSON.stringify({ repoPath, tasks: [] }, null, 2));
    }

    let release: (() => Promise<void>) | undefined;
    try {
      release = await lockfile.lock(tasksPath, { retries: 3 });
      return await fn();
    } finally {
      if (release) {
        await release();
      }
    }
  }

  async getTasks(repoPath: string, status?: TaskStatus): Promise<Task[]> {
    const tasksFile = await this.readTasksFile(repoPath);
    if (status) {
      return tasksFile.tasks.filter(t => t.status === status);
    }
    return tasksFile.tasks;
  }

  async getTask(repoPath: string, taskId: string): Promise<Task | null> {
    const tasksFile = await this.readTasksFile(repoPath);
    return tasksFile.tasks.find(t => t.id === taskId) || null;
  }

  async createTask(repoPath: string, input: CreateTaskInput): Promise<Task> {
    return this.withLock(repoPath, async () => {
      const tasksFile = await this.readTasksFile(repoPath);
      const now = new Date().toISOString();

      const task: Task = {
        id: `t_${nanoid(10)}`,
        name: input.name,
        description: input.description,
        status: 'TODO',
        todos: [],
        createdAt: now,
        updatedAt: now,
      };

      tasksFile.tasks.push(task);
      await this.writeTasksFile(repoPath, tasksFile);
      return task;
    });
  }

  async updateTask(repoPath: string, taskId: string, input: UpdateTaskInput): Promise<Task> {
    return this.withLock(repoPath, async () => {
      const tasksFile = await this.readTasksFile(repoPath);
      const taskIndex = tasksFile.tasks.findIndex(t => t.id === taskId);

      if (taskIndex === -1) {
        throw new Error(`Task not found: ${taskId}`);
      }

      const task = tasksFile.tasks[taskIndex];
      const updated: Task = {
        ...task,
        name: input.name ?? task.name,
        description: input.description ?? task.description,
        updatedAt: new Date().toISOString(),
      };

      tasksFile.tasks[taskIndex] = updated;
      await this.writeTasksFile(repoPath, tasksFile);
      return updated;
    });
  }

  async updateTaskStatus(repoPath: string, taskId: string, status: TaskStatus): Promise<Task> {
    return this.withLock(repoPath, async () => {
      const tasksFile = await this.readTasksFile(repoPath);
      const taskIndex = tasksFile.tasks.findIndex(t => t.id === taskId);

      if (taskIndex === -1) {
        throw new Error(`Task not found: ${taskId}`);
      }

      const task = tasksFile.tasks[taskIndex];
      const updated: Task = {
        ...task,
        status,
        updatedAt: new Date().toISOString(),
      };

      tasksFile.tasks[taskIndex] = updated;
      await this.writeTasksFile(repoPath, tasksFile);
      return updated;
    });
  }

  async deleteTask(repoPath: string, taskId: string): Promise<void> {
    return this.withLock(repoPath, async () => {
      const tasksFile = await this.readTasksFile(repoPath);
      tasksFile.tasks = tasksFile.tasks.filter(t => t.id !== taskId);
      await this.writeTasksFile(repoPath, tasksFile);
    });
  }

  async linkPlan(repoPath: string, taskId: string, planPath: string): Promise<Task> {
    return this.withLock(repoPath, async () => {
      const tasksFile = await this.readTasksFile(repoPath);
      const taskIndex = tasksFile.tasks.findIndex(t => t.id === taskId);

      if (taskIndex === -1) {
        throw new Error(`Task not found: ${taskId}`);
      }

      const task = tasksFile.tasks[taskIndex];
      const updated: Task = {
        ...task,
        planPath,
        updatedAt: new Date().toISOString(),
      };

      tasksFile.tasks[taskIndex] = updated;
      await this.writeTasksFile(repoPath, tasksFile);
      return updated;
    });
  }

  async unlinkPlan(repoPath: string, taskId: string): Promise<Task> {
    return this.withLock(repoPath, async () => {
      const tasksFile = await this.readTasksFile(repoPath);
      const taskIndex = tasksFile.tasks.findIndex(t => t.id === taskId);

      if (taskIndex === -1) {
        throw new Error(`Task not found: ${taskId}`);
      }

      const task = tasksFile.tasks[taskIndex];
      const { planPath, ...rest } = task;
      const updated: Task = {
        ...rest,
        updatedAt: new Date().toISOString(),
      };

      tasksFile.tasks[taskIndex] = updated;
      await this.writeTasksFile(repoPath, tasksFile);
      return updated;
    });
  }

  async addTodo(repoPath: string, taskId: string, content: string): Promise<Task> {
    return this.withLock(repoPath, async () => {
      const tasksFile = await this.readTasksFile(repoPath);
      const taskIndex = tasksFile.tasks.findIndex(t => t.id === taskId);

      if (taskIndex === -1) {
        throw new Error(`Task not found: ${taskId}`);
      }

      const task = tasksFile.tasks[taskIndex];
      const todo: Todo = {
        id: `td_${nanoid(8)}`,
        content,
        completed: false,
      };

      const updated: Task = {
        ...task,
        todos: [...task.todos, todo],
        updatedAt: new Date().toISOString(),
      };

      tasksFile.tasks[taskIndex] = updated;
      await this.writeTasksFile(repoPath, tasksFile);
      return updated;
    });
  }

  async updateTodo(repoPath: string, taskId: string, todoId: string, completed: boolean): Promise<Task> {
    return this.withLock(repoPath, async () => {
      const tasksFile = await this.readTasksFile(repoPath);
      const taskIndex = tasksFile.tasks.findIndex(t => t.id === taskId);

      if (taskIndex === -1) {
        throw new Error(`Task not found: ${taskId}`);
      }

      const task = tasksFile.tasks[taskIndex];
      const todoIndex = task.todos.findIndex(td => td.id === todoId);

      if (todoIndex === -1) {
        throw new Error(`Todo not found: ${todoId}`);
      }

      const updatedTodos = [...task.todos];
      updatedTodos[todoIndex] = { ...updatedTodos[todoIndex], completed };

      const updated: Task = {
        ...task,
        todos: updatedTodos,
        updatedAt: new Date().toISOString(),
      };

      tasksFile.tasks[taskIndex] = updated;
      await this.writeTasksFile(repoPath, tasksFile);
      return updated;
    });
  }

  async deleteTodo(repoPath: string, taskId: string, todoId: string): Promise<Task> {
    return this.withLock(repoPath, async () => {
      const tasksFile = await this.readTasksFile(repoPath);
      const taskIndex = tasksFile.tasks.findIndex(t => t.id === taskId);

      if (taskIndex === -1) {
        throw new Error(`Task not found: ${taskId}`);
      }

      const task = tasksFile.tasks[taskIndex];
      const updated: Task = {
        ...task,
        todos: task.todos.filter(td => td.id !== todoId),
        updatedAt: new Date().toISOString(),
      };

      tasksFile.tasks[taskIndex] = updated;
      await this.writeTasksFile(repoPath, tasksFile);
      return updated;
    });
  }
}
```

**Step 4: Update index.ts**

```typescript
// packages/core/src/index.ts
export * from './types.js';
export * from './repo.js';
export * from './storage.js';
```

**Step 5: Run test to verify it passes**

Run: `npm test -w @claude-task-manage/core`
Expected: PASS (all tests)

**Step 6: Commit**

```bash
git add -A
git commit -m "feat(core): add file-based task storage with embedded todos"
```

---

## Task 5: MCP Server

**Files:**
- Create: `packages/mcp/src/index.ts`
- Create: `packages/mcp/src/tools.ts`

**Step 1: Create tools definition**

```typescript
// packages/mcp/src/tools.ts
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { TaskStorage, TaskStatus } from '@claude-task-manage/core';

export const tools: Tool[] = [
  {
    name: 'create_task',
    description: 'Create a new task with TODO status for the current git repository',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Short name for the task' },
        description: { type: 'string', description: 'Detailed description of the task' },
      },
      required: ['name', 'description'],
    },
  },
  {
    name: 'list_tasks',
    description: 'List all tasks for the current git repository',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['TODO', 'INPROGRESS', 'DONE'],
          description: 'Filter tasks by status (optional)',
        },
      },
    },
  },
  {
    name: 'get_task',
    description: 'Get details of a specific task including its todos',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Task ID (starts with t_)' },
      },
      required: ['id'],
    },
  },
  {
    name: 'update_task_status',
    description: 'Update the status of a task (TODO -> INPROGRESS -> DONE)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Task ID' },
        status: {
          type: 'string',
          enum: ['TODO', 'INPROGRESS', 'DONE'],
          description: 'New status',
        },
      },
      required: ['id', 'status'],
    },
  },
  {
    name: 'update_task',
    description: 'Update task name or description',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Task ID' },
        name: { type: 'string', description: 'New name (optional)' },
        description: { type: 'string', description: 'New description (optional)' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_task',
    description: 'Delete a task',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Task ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'link_plan',
    description: 'Associate a plan file with a task',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Task ID' },
        planPath: { type: 'string', description: 'Path to plan file (e.g., ~/.claude/plans/plan.md)' },
      },
      required: ['id', 'planPath'],
    },
  },
  {
    name: 'unlink_plan',
    description: 'Remove plan association from a task',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Task ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'add_todo',
    description: 'Add a todo item to a task',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Task ID' },
        content: { type: 'string', description: 'Todo item content' },
      },
      required: ['id', 'content'],
    },
  },
  {
    name: 'update_todo',
    description: 'Update a todo item completion status',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Task ID' },
        todoId: { type: 'string', description: 'Todo ID (starts with td_)' },
        completed: { type: 'boolean', description: 'Completion status' },
      },
      required: ['id', 'todoId', 'completed'],
    },
  },
  {
    name: 'delete_todo',
    description: 'Delete a todo item from a task',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Task ID' },
        todoId: { type: 'string', description: 'Todo ID' },
      },
      required: ['id', 'todoId'],
    },
  },
];

export async function handleToolCall(
  storage: TaskStorage,
  repoPath: string,
  toolName: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  try {
    switch (toolName) {
      case 'create_task': {
        const task = await storage.createTask(repoPath, {
          name: args.name as string,
          description: args.description as string,
        });
        return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] };
      }

      case 'list_tasks': {
        const status = args.status as TaskStatus | undefined;
        const tasks = await storage.getTasks(repoPath, status);
        return { content: [{ type: 'text', text: JSON.stringify(tasks, null, 2) }] };
      }

      case 'get_task': {
        const task = await storage.getTask(repoPath, args.id as string);
        if (!task) {
          const allTasks = await storage.getTasks(repoPath);
          const availableIds = allTasks.map(t => t.id).join(', ');
          return {
            content: [{ type: 'text', text: `Task not found: ${args.id}. Available IDs: ${availableIds || 'none'}` }],
            isError: true,
          };
        }
        return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] };
      }

      case 'update_task_status': {
        const task = await storage.updateTaskStatus(repoPath, args.id as string, args.status as TaskStatus);
        return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] };
      }

      case 'update_task': {
        const task = await storage.updateTask(repoPath, args.id as string, {
          name: args.name as string | undefined,
          description: args.description as string | undefined,
        });
        return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] };
      }

      case 'delete_task': {
        await storage.deleteTask(repoPath, args.id as string);
        return { content: [{ type: 'text', text: `Task ${args.id} deleted` }] };
      }

      case 'link_plan': {
        const task = await storage.linkPlan(repoPath, args.id as string, args.planPath as string);
        return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] };
      }

      case 'unlink_plan': {
        const task = await storage.unlinkPlan(repoPath, args.id as string);
        return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] };
      }

      case 'add_todo': {
        const task = await storage.addTodo(repoPath, args.id as string, args.content as string);
        return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] };
      }

      case 'update_todo': {
        const task = await storage.updateTodo(
          repoPath,
          args.id as string,
          args.todoId as string,
          args.completed as boolean
        );
        return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] };
      }

      case 'delete_todo': {
        const task = await storage.deleteTodo(repoPath, args.id as string, args.todoId as string);
        return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] };
      }

      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${toolName}` }], isError: true };
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}
```

**Step 2: Create MCP server entry point**

```typescript
// packages/mcp/src/index.ts
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { TaskStorage, getRepoRoot } from '@claude-task-manage/core';
import { tools, handleToolCall } from './tools.js';

const server = new Server(
  { name: 'task-manager', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

const storage = new TaskStorage();

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const repoPath = await getRepoRoot();
  if (!repoPath) {
    return {
      content: [{ type: 'text', text: 'Error: Not in a git repository' }],
      isError: true,
    };
  }

  await storage.initRepo(repoPath);
  return handleToolCall(storage, repoPath, request.params.name, request.params.arguments || {});
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

**Step 3: Build MCP package**

Run: `npm run build -w @claude-task-manage/core && npm run build -w @claude-task-manage/mcp`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add -A
git commit -m "feat(mcp): implement MCP server with task and todo management tools"
```

---

## Task 6: TUI - Basic App Structure

**Files:**
- Create: `packages/tui/src/index.tsx`
- Create: `packages/tui/src/App.tsx`
- Create: `packages/tui/src/hooks/useTasks.ts`

**Step 1: Create useTasks hook**

```typescript
// packages/tui/src/hooks/useTasks.ts
import { useState, useEffect, useCallback } from 'react';
import { watch } from 'chokidar';
import { TaskStorage, Task, TaskStatus, getRepoRoot, getRepoHash } from '@claude-task-manage/core';
import * as path from 'path';
import * as os from 'os';

const storage = new TaskStorage();

export function useTasks(initialRepoPath?: string) {
  const [repoPath, setRepoPath] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const detectedPath = initialRepoPath || await getRepoRoot();
        if (!detectedPath) {
          setError('Not in a git repository');
          setLoading(false);
          return;
        }
        setRepoPath(detectedPath);
        await storage.initRepo(detectedPath);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize');
        setLoading(false);
      }
    }
    init();
  }, [initialRepoPath]);

  useEffect(() => {
    if (!repoPath) return;

    async function loadTasks() {
      try {
        const loaded = await storage.getTasks(repoPath!);
        setTasks(loaded);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
        setLoading(false);
      }
    }

    loadTasks();

    const hash = getRepoHash(repoPath);
    const tasksPath = path.join(os.homedir(), '.claude-tasks', hash, 'tasks.json');
    const watcher = watch(tasksPath, { ignoreInitial: true });
    watcher.on('change', loadTasks);

    return () => { watcher.close(); };
  }, [repoPath]);

  const createTask = useCallback(async (name: string, description: string) => {
    if (!repoPath) return;
    const task = await storage.createTask(repoPath, { name, description });
    setTasks(prev => [...prev, task]);
    return task;
  }, [repoPath]);

  const updateStatus = useCallback(async (taskId: string, status: TaskStatus) => {
    if (!repoPath) return;
    const updated = await storage.updateTaskStatus(repoPath, taskId, status);
    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    return updated;
  }, [repoPath]);

  const updateTask = useCallback(async (taskId: string, name?: string, description?: string) => {
    if (!repoPath) return;
    const updated = await storage.updateTask(repoPath, taskId, { name, description });
    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    return updated;
  }, [repoPath]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!repoPath) return;
    await storage.deleteTask(repoPath, taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, [repoPath]);

  const linkPlan = useCallback(async (taskId: string, planPath: string) => {
    if (!repoPath) return;
    const updated = await storage.linkPlan(repoPath, taskId, planPath);
    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    return updated;
  }, [repoPath]);

  const addTodo = useCallback(async (taskId: string, content: string) => {
    if (!repoPath) return;
    const updated = await storage.addTodo(repoPath, taskId, content);
    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    return updated;
  }, [repoPath]);

  const updateTodo = useCallback(async (taskId: string, todoId: string, completed: boolean) => {
    if (!repoPath) return;
    const updated = await storage.updateTodo(repoPath, taskId, todoId, completed);
    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    return updated;
  }, [repoPath]);

  const deleteTodo = useCallback(async (taskId: string, todoId: string) => {
    if (!repoPath) return;
    const updated = await storage.deleteTodo(repoPath, taskId, todoId);
    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    return updated;
  }, [repoPath]);

  return {
    repoPath, tasks, loading, error,
    createTask, updateStatus, updateTask, deleteTask, linkPlan,
    addTodo, updateTodo, deleteTodo,
  };
}
```

**Step 2: Create App component**

```typescript
// packages/tui/src/App.tsx
import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { Task, TaskStatus } from '@claude-task-manage/core';
import { useTasks } from './hooks/useTasks.js';

interface AppProps {
  repoPath?: string;
}

const STATUSES: TaskStatus[] = ['TODO', 'INPROGRESS', 'DONE'];

export function App({ repoPath: initialRepoPath }: AppProps) {
  const { exit } = useApp();
  const { repoPath, tasks, loading, error, updateStatus, deleteTask, updateTodo } = useTasks(initialRepoPath);

  const [focusedColumn, setFocusedColumn] = useState(0);
  const [focusedTaskIndex, setFocusedTaskIndex] = useState<Record<number, number>>({ 0: 0, 1: 0, 2: 0 });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const tasksByStatus = {
    TODO: tasks.filter(t => t.status === 'TODO'),
    INPROGRESS: tasks.filter(t => t.status === 'INPROGRESS'),
    DONE: tasks.filter(t => t.status === 'DONE'),
  };

  const getCurrentTask = () => {
    const currentStatus = STATUSES[focusedColumn];
    const currentTasks = tasksByStatus[currentStatus];
    const currentIndex = focusedTaskIndex[focusedColumn] || 0;
    return currentTasks[currentIndex];
  };

  useInput((input, key) => {
    if (input === 'q') {
      exit();
      return;
    }

    const currentTask = getCurrentTask();

    if (key.leftArrow || input === 'h') {
      if (currentTask) {
        const newStatusIndex = Math.max(0, focusedColumn - 1);
        if (newStatusIndex !== focusedColumn) {
          updateStatus(currentTask.id, STATUSES[newStatusIndex]);
        }
      }
    } else if (key.rightArrow || input === 'l') {
      if (currentTask) {
        const newStatusIndex = Math.min(2, focusedColumn + 1);
        if (newStatusIndex !== focusedColumn) {
          updateStatus(currentTask.id, STATUSES[newStatusIndex]);
        }
      }
    } else if (key.upArrow || input === 'k') {
      const currentStatus = STATUSES[focusedColumn];
      const maxIndex = tasksByStatus[currentStatus].length - 1;
      setFocusedTaskIndex(prev => ({
        ...prev,
        [focusedColumn]: Math.max(0, (prev[focusedColumn] || 0) - 1),
      }));
    } else if (key.downArrow || input === 'j') {
      const currentStatus = STATUSES[focusedColumn];
      const maxIndex = tasksByStatus[currentStatus].length - 1;
      setFocusedTaskIndex(prev => ({
        ...prev,
        [focusedColumn]: Math.min(maxIndex, (prev[focusedColumn] || 0) + 1),
      }));
    } else if (key.tab) {
      setFocusedColumn(prev => (prev + 1) % 3);
    } else if (input === 'd' && currentTask) {
      deleteTask(currentTask.id);
    } else if (key.return && currentTask) {
      setSelectedTask(selectedTask?.id === currentTask.id ? null : currentTask);
    }
  });

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text color="red">Error: {error}</Text>;

  const repoName = repoPath?.split('/').pop() || 'unknown';

  return (
    <Box flexDirection="column" width="100%">
      <Box borderStyle="single" paddingX={1}>
        <Text bold>claude-tasks: {repoName}</Text>
      </Box>

      <Box flexGrow={1}>
        <Box flexGrow={1} flexDirection="row">
          {STATUSES.map((status, colIndex) => (
            <Box
              key={status}
              flexDirection="column"
              flexGrow={1}
              borderStyle="single"
              borderColor={focusedColumn === colIndex ? 'cyan' : undefined}
            >
              <Box paddingX={1}>
                <Text bold>{status} ({tasksByStatus[status].length})</Text>
              </Box>
              <Box flexDirection="column" paddingX={1}>
                {tasksByStatus[status].map((task, taskIndex) => {
                  const isFocused = focusedColumn === colIndex && focusedTaskIndex[colIndex] === taskIndex;
                  const completedTodos = task.todos.filter(t => t.completed).length;
                  const totalTodos = task.todos.length;
                  const indicators = [];
                  if (task.planPath) indicators.push('[P]');
                  if (totalTodos > 0) indicators.push(`[T ${completedTodos}/${totalTodos}]`);

                  return (
                    <Box key={task.id} marginY={0}>
                      <Text
                        backgroundColor={isFocused ? 'cyan' : undefined}
                        color={isFocused ? 'black' : undefined}
                      >
                        {isFocused ? '> ' : '  '}
                        {task.name.slice(0, 18)}
                        {indicators.length > 0 ? ` ${indicators.join(' ')}` : ''}
                      </Text>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>

        <Box flexDirection="column" width={30} borderStyle="single" borderColor="gray">
          <Box paddingX={1}><Text bold>Details</Text></Box>
          {selectedTask ? (
            <Box flexDirection="column" paddingX={1}>
              <Text bold>{selectedTask.name}</Text>
              <Text dimColor>{selectedTask.status}</Text>
              <Text>-------------</Text>
              <Text wrap="wrap">{selectedTask.description}</Text>
              {selectedTask.planPath && (
                <>
                  <Text>-------------</Text>
                  <Text dimColor>Plan:</Text>
                  <Text>{selectedTask.planPath.split('/').pop()}</Text>
                </>
              )}
              {selectedTask.todos.length > 0 && (
                <>
                  <Text>-------------</Text>
                  <Text dimColor>Todos:</Text>
                  {selectedTask.todos.map(todo => (
                    <Text key={todo.id}>
                      {todo.completed ? '[x]' : '[ ]'} {todo.content}
                    </Text>
                  ))}
                </>
              )}
            </Box>
          ) : (
            <Box paddingX={1}><Text dimColor>Select a task</Text></Box>
          )}
        </Box>
      </Box>

      <Box borderStyle="single" paddingX={1}>
        <Text dimColor>[n] New  [e] Edit  [arrows] Move  [d] Delete  [p] Plan  [t] Todo  [q] Quit</Text>
      </Box>
    </Box>
  );
}
```

**Step 3: Create entry point**

```typescript
// packages/tui/src/index.tsx
#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './App.js';

const args = process.argv.slice(2);
let repoPath: string | undefined;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--repo' && args[i + 1]) {
    repoPath = args[i + 1];
    break;
  }
}

render(<App repoPath={repoPath} />);
```

**Step 4: Build TUI package**

Run: `npm run build -w @claude-task-manage/core && npm run build -w @claude-task-manage/tui`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add -A
git commit -m "feat(tui): implement kanban TUI with embedded todos display"
```

---

## Task 7: TUI - Create/Edit Task Forms

**Files:**
- Create: `packages/tui/src/components/CreateTaskForm.tsx`
- Create: `packages/tui/src/components/EditTaskForm.tsx`
- Modify: `packages/tui/src/App.tsx`

**Step 1: Create CreateTaskForm component**

```typescript
// packages/tui/src/components/CreateTaskForm.tsx
import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';

interface CreateTaskFormProps {
  onSubmit: (name: string, description: string) => void;
  onCancel: () => void;
}

export function CreateTaskForm({ onSubmit, onCancel }: CreateTaskFormProps) {
  const [step, setStep] = useState<'name' | 'description'>('name');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useInput((_, key) => {
    if (key.escape) onCancel();
  });

  const handleNameSubmit = () => {
    if (name.trim()) setStep('description');
  };

  const handleDescriptionSubmit = () => {
    if (description.trim()) onSubmit(name.trim(), description.trim());
  };

  return (
    <Box flexDirection="column" borderStyle="single" padding={1}>
      <Text bold>Create New Task</Text>
      <Text dimColor>(Esc to cancel)</Text>
      <Box marginTop={1}>
        <Text>Name: </Text>
        {step === 'name' ? (
          <TextInput value={name} onChange={setName} onSubmit={handleNameSubmit} />
        ) : (
          <Text>{name}</Text>
        )}
      </Box>
      {step === 'description' && (
        <Box marginTop={1}>
          <Text>Description: </Text>
          <TextInput value={description} onChange={setDescription} onSubmit={handleDescriptionSubmit} />
        </Box>
      )}
    </Box>
  );
}
```

**Step 2: Create EditTaskForm component**

```typescript
// packages/tui/src/components/EditTaskForm.tsx
import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { Task } from '@claude-task-manage/core';

interface EditTaskFormProps {
  task: Task;
  onSubmit: (name: string, description: string) => void;
  onCancel: () => void;
}

export function EditTaskForm({ task, onSubmit, onCancel }: EditTaskFormProps) {
  const [step, setStep] = useState<'name' | 'description'>('name');
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description);

  useInput((_, key) => {
    if (key.escape) onCancel();
  });

  const handleNameSubmit = () => setStep('description');

  const handleDescriptionSubmit = () => {
    if (name.trim() && description.trim()) {
      onSubmit(name.trim(), description.trim());
    }
  };

  return (
    <Box flexDirection="column" borderStyle="single" padding={1}>
      <Text bold>Edit Task</Text>
      <Text dimColor>(Esc to cancel)</Text>
      <Box marginTop={1}>
        <Text>Name: </Text>
        {step === 'name' ? (
          <TextInput value={name} onChange={setName} onSubmit={handleNameSubmit} />
        ) : (
          <Text>{name}</Text>
        )}
      </Box>
      {step === 'description' && (
        <Box marginTop={1}>
          <Text>Description: </Text>
          <TextInput value={description} onChange={setDescription} onSubmit={handleDescriptionSubmit} />
        </Box>
      )}
    </Box>
  );
}
```

**Step 3: Update App.tsx to handle forms**

Add state for `mode: 'normal' | 'create' | 'edit'` and render forms conditionally.
Handle 'n' key to enter create mode, 'e' key to enter edit mode.

**Step 4: Build and test**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add -A
git commit -m "feat(tui): add create and edit task forms"
```

---

## Task 8: TUI - Add Todo Form

**Files:**
- Create: `packages/tui/src/components/AddTodoForm.tsx`
- Modify: `packages/tui/src/App.tsx`

**Step 1: Create AddTodoForm component**

```typescript
// packages/tui/src/components/AddTodoForm.tsx
import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';

interface AddTodoFormProps {
  taskName: string;
  onSubmit: (content: string) => void;
  onCancel: () => void;
}

export function AddTodoForm({ taskName, onSubmit, onCancel }: AddTodoFormProps) {
  const [content, setContent] = useState('');

  useInput((_, key) => {
    if (key.escape) onCancel();
  });

  const handleSubmit = () => {
    if (content.trim()) onSubmit(content.trim());
  };

  return (
    <Box flexDirection="column" borderStyle="single" padding={1}>
      <Text bold>Add Todo to: {taskName}</Text>
      <Text dimColor>(Esc to cancel)</Text>
      <Box marginTop={1}>
        <Text>Todo: </Text>
        <TextInput value={content} onChange={setContent} onSubmit={handleSubmit} />
      </Box>
    </Box>
  );
}
```

**Step 2: Update App.tsx**

Add 't' key handler to enter add-todo mode when a task is selected.

**Step 3: Build and test**

**Step 4: Commit**

```bash
git add -A
git commit -m "feat(tui): add todo creation form"
```

---

## Task 9: TUI - Link Plan Picker

**Files:**
- Create: `packages/tui/src/components/PlanPicker.tsx`
- Modify: `packages/tui/src/App.tsx`

**Step 1: Create PlanPicker component**

```typescript
// packages/tui/src/components/PlanPicker.tsx
import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

interface PlanPickerProps {
  onSelect: (planPath: string) => void;
  onCancel: () => void;
}

export function PlanPicker({ onSelect, onCancel }: PlanPickerProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFiles() {
      const plansDir = path.join(os.homedir(), '.claude', 'plans');
      try {
        const entries = await fs.readdir(plansDir);
        const mdFiles = entries.filter(f => f.endsWith('.md'));
        setFiles(mdFiles);
      } catch {
        setFiles([]);
      }
      setLoading(false);
    }
    loadFiles();
  }, []);

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
    } else if (key.upArrow || input === 'k') {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    } else if (key.downArrow || input === 'j') {
      setSelectedIndex(prev => Math.min(files.length - 1, prev + 1));
    } else if (key.return && files[selectedIndex]) {
      const fullPath = path.join('~/.claude/plans', files[selectedIndex]);
      onSelect(fullPath);
    }
  });

  if (loading) return <Text>Loading plans...</Text>;

  return (
    <Box flexDirection="column" borderStyle="single" padding={1}>
      <Text bold>Select Plan</Text>
      <Text dimColor>(Esc to cancel)</Text>
      {files.length === 0 ? (
        <Text dimColor>No plans found in ~/.claude/plans/</Text>
      ) : (
        files.map((file, idx) => (
          <Text key={file} backgroundColor={idx === selectedIndex ? 'cyan' : undefined}>
            {idx === selectedIndex ? '> ' : '  '}{file}
          </Text>
        ))
      )}
    </Box>
  );
}
```

**Step 2: Update App.tsx**

Add 'p' key handler to enter plan-picker mode when a task is selected.

**Step 3: Build and test**

**Step 4: Commit**

```bash
git add -A
git commit -m "feat(tui): add plan file picker"
```

---

## Task 10: Final Polish

**Files:**
- Create: `README.md`
- Verify bin scripts work

**Step 1: Create README**

```markdown
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
```

**Step 2: Build all packages**

Run: `npm run build`
Expected: All packages build successfully

**Step 3: Test TUI locally**

Run: `node packages/tui/dist/index.js`
Expected: TUI launches and displays kanban board

**Step 4: Commit**

```bash
git add -A
git commit -m "docs: add README and finalize package configuration"
```

---

## Summary

This plan implements:
1. **Core package**: Types, storage with embedded todos, repo detection
2. **MCP package**: 11 tools for task and todo management
3. **TUI package**: Full kanban interface with CRUD operations

Each task includes complete code, exact file paths, and commit steps.
