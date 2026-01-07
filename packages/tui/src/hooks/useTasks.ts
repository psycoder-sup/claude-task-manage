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
