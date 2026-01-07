import { useState, useEffect, useCallback } from 'react';
import { watch } from 'chokidar';
import { TaskStorage, getRepoRoot, getRepoHash } from '@claude-task-manage/core';
import * as path from 'path';
import * as os from 'os';
const storage = new TaskStorage();
export function useTasks(initialRepoPath) {
    const [repoPath, setRepoPath] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to initialize');
                setLoading(false);
            }
        }
        init();
    }, [initialRepoPath]);
    useEffect(() => {
        if (!repoPath)
            return;
        async function loadTasks() {
            try {
                const loaded = await storage.getTasks(repoPath);
                setTasks(loaded);
                setLoading(false);
            }
            catch (err) {
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
    const createTask = useCallback(async (name, description) => {
        if (!repoPath)
            return;
        const task = await storage.createTask(repoPath, { name, description });
        setTasks(prev => [...prev, task]);
        return task;
    }, [repoPath]);
    const updateStatus = useCallback(async (taskId, status) => {
        if (!repoPath)
            return;
        const updated = await storage.updateTaskStatus(repoPath, taskId, status);
        setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
        return updated;
    }, [repoPath]);
    const updateTask = useCallback(async (taskId, name, description) => {
        if (!repoPath)
            return;
        const updated = await storage.updateTask(repoPath, taskId, { name, description });
        setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
        return updated;
    }, [repoPath]);
    const deleteTask = useCallback(async (taskId) => {
        if (!repoPath)
            return;
        await storage.deleteTask(repoPath, taskId);
        setTasks(prev => prev.filter(t => t.id !== taskId));
    }, [repoPath]);
    const linkPlan = useCallback(async (taskId, planPath) => {
        if (!repoPath)
            return;
        const updated = await storage.linkPlan(repoPath, taskId, planPath);
        setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
        return updated;
    }, [repoPath]);
    const addTodo = useCallback(async (taskId, content) => {
        if (!repoPath)
            return;
        const updated = await storage.addTodo(repoPath, taskId, content);
        setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
        return updated;
    }, [repoPath]);
    const updateTodo = useCallback(async (taskId, todoId, completed) => {
        if (!repoPath)
            return;
        const updated = await storage.updateTodo(repoPath, taskId, todoId, completed);
        setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
        return updated;
    }, [repoPath]);
    const deleteTodo = useCallback(async (taskId, todoId) => {
        if (!repoPath)
            return;
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
//# sourceMappingURL=useTasks.js.map