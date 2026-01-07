import * as fs from 'fs/promises';
import * as path from 'path';
import { nanoid } from 'nanoid';
import lockfile from 'proper-lockfile';
import { TasksFileSchema, IndexFileSchema } from './types.js';
import { getRepoHash } from './repo.js';
export class TaskStorage {
    baseDir;
    constructor(baseDir) {
        this.baseDir = baseDir || path.join(process.env.HOME || '~', '.claude-tasks');
    }
    async ensureDir(dir) {
        await fs.mkdir(dir, { recursive: true });
    }
    getIndexPath() {
        return path.join(this.baseDir, 'index.json');
    }
    getTasksDir(repoPath) {
        const hash = getRepoHash(repoPath);
        return path.join(this.baseDir, hash);
    }
    getTasksPath(repoPath) {
        return path.join(this.getTasksDir(repoPath), 'tasks.json');
    }
    async getIndex() {
        try {
            const content = await fs.readFile(this.getIndexPath(), 'utf-8');
            return IndexFileSchema.parse(JSON.parse(content));
        }
        catch {
            return { repos: {} };
        }
    }
    async saveIndex(index) {
        await this.ensureDir(this.baseDir);
        await fs.writeFile(this.getIndexPath(), JSON.stringify(index, null, 2));
    }
    async initRepo(repoPath) {
        const hash = getRepoHash(repoPath);
        const tasksDir = this.getTasksDir(repoPath);
        const tasksPath = this.getTasksPath(repoPath);
        await this.ensureDir(tasksDir);
        try {
            await fs.access(tasksPath);
        }
        catch {
            const tasksFile = { repoPath, tasks: [] };
            await fs.writeFile(tasksPath, JSON.stringify(tasksFile, null, 2));
        }
        const index = await this.getIndex();
        index.repos[hash] = repoPath;
        await this.saveIndex(index);
    }
    async readTasksFile(repoPath) {
        const tasksPath = this.getTasksPath(repoPath);
        try {
            const content = await fs.readFile(tasksPath, 'utf-8');
            return TasksFileSchema.parse(JSON.parse(content));
        }
        catch {
            return { repoPath, tasks: [] };
        }
    }
    async writeTasksFile(repoPath, tasksFile) {
        const tasksPath = this.getTasksPath(repoPath);
        const tasksDir = path.dirname(tasksPath);
        await this.ensureDir(tasksDir);
        await fs.writeFile(tasksPath, JSON.stringify(tasksFile, null, 2));
    }
    async withLock(repoPath, fn) {
        const tasksPath = this.getTasksPath(repoPath);
        const tasksDir = path.dirname(tasksPath);
        await this.ensureDir(tasksDir);
        try {
            await fs.access(tasksPath);
        }
        catch {
            await fs.writeFile(tasksPath, JSON.stringify({ repoPath, tasks: [] }, null, 2));
        }
        let release;
        try {
            release = await lockfile.lock(tasksPath, { retries: 3 });
            return await fn();
        }
        finally {
            if (release) {
                await release();
            }
        }
    }
    async getTasks(repoPath, status) {
        const tasksFile = await this.readTasksFile(repoPath);
        if (status) {
            return tasksFile.tasks.filter(t => t.status === status);
        }
        return tasksFile.tasks;
    }
    async getTask(repoPath, taskId) {
        const tasksFile = await this.readTasksFile(repoPath);
        return tasksFile.tasks.find(t => t.id === taskId) || null;
    }
    async createTask(repoPath, input) {
        return this.withLock(repoPath, async () => {
            const tasksFile = await this.readTasksFile(repoPath);
            const now = new Date().toISOString();
            const task = {
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
    async updateTask(repoPath, taskId, input) {
        return this.withLock(repoPath, async () => {
            const tasksFile = await this.readTasksFile(repoPath);
            const taskIndex = tasksFile.tasks.findIndex(t => t.id === taskId);
            if (taskIndex === -1) {
                throw new Error(`Task not found: ${taskId}`);
            }
            const task = tasksFile.tasks[taskIndex];
            const updated = {
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
    async updateTaskStatus(repoPath, taskId, status) {
        return this.withLock(repoPath, async () => {
            const tasksFile = await this.readTasksFile(repoPath);
            const taskIndex = tasksFile.tasks.findIndex(t => t.id === taskId);
            if (taskIndex === -1) {
                throw new Error(`Task not found: ${taskId}`);
            }
            const task = tasksFile.tasks[taskIndex];
            const updated = {
                ...task,
                status,
                updatedAt: new Date().toISOString(),
            };
            tasksFile.tasks[taskIndex] = updated;
            await this.writeTasksFile(repoPath, tasksFile);
            return updated;
        });
    }
    async deleteTask(repoPath, taskId) {
        return this.withLock(repoPath, async () => {
            const tasksFile = await this.readTasksFile(repoPath);
            tasksFile.tasks = tasksFile.tasks.filter(t => t.id !== taskId);
            await this.writeTasksFile(repoPath, tasksFile);
        });
    }
    async linkPlan(repoPath, taskId, planPath) {
        return this.withLock(repoPath, async () => {
            const tasksFile = await this.readTasksFile(repoPath);
            const taskIndex = tasksFile.tasks.findIndex(t => t.id === taskId);
            if (taskIndex === -1) {
                throw new Error(`Task not found: ${taskId}`);
            }
            const task = tasksFile.tasks[taskIndex];
            const updated = {
                ...task,
                planPath,
                updatedAt: new Date().toISOString(),
            };
            tasksFile.tasks[taskIndex] = updated;
            await this.writeTasksFile(repoPath, tasksFile);
            return updated;
        });
    }
    async unlinkPlan(repoPath, taskId) {
        return this.withLock(repoPath, async () => {
            const tasksFile = await this.readTasksFile(repoPath);
            const taskIndex = tasksFile.tasks.findIndex(t => t.id === taskId);
            if (taskIndex === -1) {
                throw new Error(`Task not found: ${taskId}`);
            }
            const task = tasksFile.tasks[taskIndex];
            const { planPath, ...rest } = task;
            const updated = {
                ...rest,
                updatedAt: new Date().toISOString(),
            };
            tasksFile.tasks[taskIndex] = updated;
            await this.writeTasksFile(repoPath, tasksFile);
            return updated;
        });
    }
    async addTodo(repoPath, taskId, content) {
        return this.withLock(repoPath, async () => {
            const tasksFile = await this.readTasksFile(repoPath);
            const taskIndex = tasksFile.tasks.findIndex(t => t.id === taskId);
            if (taskIndex === -1) {
                throw new Error(`Task not found: ${taskId}`);
            }
            const task = tasksFile.tasks[taskIndex];
            const todo = {
                id: `td_${nanoid(8)}`,
                content,
                completed: false,
            };
            const updated = {
                ...task,
                todos: [...task.todos, todo],
                updatedAt: new Date().toISOString(),
            };
            tasksFile.tasks[taskIndex] = updated;
            await this.writeTasksFile(repoPath, tasksFile);
            return updated;
        });
    }
    async updateTodo(repoPath, taskId, todoId, completed) {
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
            const updated = {
                ...task,
                todos: updatedTodos,
                updatedAt: new Date().toISOString(),
            };
            tasksFile.tasks[taskIndex] = updated;
            await this.writeTasksFile(repoPath, tasksFile);
            return updated;
        });
    }
    async deleteTodo(repoPath, taskId, todoId) {
        return this.withLock(repoPath, async () => {
            const tasksFile = await this.readTasksFile(repoPath);
            const taskIndex = tasksFile.tasks.findIndex(t => t.id === taskId);
            if (taskIndex === -1) {
                throw new Error(`Task not found: ${taskId}`);
            }
            const task = tasksFile.tasks[taskIndex];
            const updated = {
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
//# sourceMappingURL=storage.js.map