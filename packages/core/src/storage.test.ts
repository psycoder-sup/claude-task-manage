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
