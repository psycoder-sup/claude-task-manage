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
