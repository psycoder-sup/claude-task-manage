import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { useTasks } from './hooks/useTasks.js';
import { CreateTaskForm } from './components/CreateTaskForm.js';
import { EditTaskForm } from './components/EditTaskForm.js';
const STATUSES = ['TODO', 'INPROGRESS', 'DONE'];
export function App({ repoPath: initialRepoPath }) {
    const { exit } = useApp();
    const { repoPath, tasks, loading, error, createTask, updateTask, updateStatus, deleteTask } = useTasks(initialRepoPath);
    const [mode, setMode] = useState('normal');
    const [focusedColumn, setFocusedColumn] = useState(0);
    const [focusedTaskIndex, setFocusedTaskIndex] = useState({ 0: 0, 1: 0, 2: 0 });
    const [selectedTask, setSelectedTask] = useState(null);
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
        if (mode !== 'normal')
            return;
        if (input === 'q') {
            exit();
            return;
        }
        const currentTask = getCurrentTask();
        if (input === 'n') {
            setMode('create');
        }
        else if (input === 'e' && currentTask) {
            setSelectedTask(currentTask);
            setMode('edit');
        }
        else if (key.leftArrow || input === 'h') {
            if (currentTask) {
                const newStatusIndex = Math.max(0, focusedColumn - 1);
                if (newStatusIndex !== focusedColumn) {
                    updateStatus(currentTask.id, STATUSES[newStatusIndex]);
                }
            }
        }
        else if (key.rightArrow || input === 'l') {
            if (currentTask) {
                const newStatusIndex = Math.min(2, focusedColumn + 1);
                if (newStatusIndex !== focusedColumn) {
                    updateStatus(currentTask.id, STATUSES[newStatusIndex]);
                }
            }
        }
        else if (key.upArrow || input === 'k') {
            setFocusedTaskIndex(prev => ({
                ...prev,
                [focusedColumn]: Math.max(0, (prev[focusedColumn] || 0) - 1),
            }));
        }
        else if (key.downArrow || input === 'j') {
            const currentStatus = STATUSES[focusedColumn];
            const maxIndex = tasksByStatus[currentStatus].length - 1;
            setFocusedTaskIndex(prev => ({
                ...prev,
                [focusedColumn]: Math.min(maxIndex, (prev[focusedColumn] || 0) + 1),
            }));
        }
        else if (key.tab) {
            setFocusedColumn(prev => (prev + 1) % 3);
        }
        else if (input === 'd' && currentTask) {
            deleteTask(currentTask.id);
        }
        else if (key.return && currentTask) {
            setSelectedTask(selectedTask?.id === currentTask.id ? null : currentTask);
        }
    });
    const handleCreateSubmit = async (name, description) => {
        await createTask(name, description);
        setMode('normal');
    };
    const handleEditSubmit = async (name, description) => {
        if (selectedTask) {
            await updateTask(selectedTask.id, name, description);
        }
        setMode('normal');
    };
    const handleCancel = () => {
        setMode('normal');
    };
    if (loading)
        return _jsx(Text, { children: "Loading..." });
    if (error)
        return _jsxs(Text, { color: "red", children: ["Error: ", error] });
    if (mode === 'create') {
        return _jsx(CreateTaskForm, { onSubmit: handleCreateSubmit, onCancel: handleCancel });
    }
    if (mode === 'edit' && selectedTask) {
        return _jsx(EditTaskForm, { task: selectedTask, onSubmit: handleEditSubmit, onCancel: handleCancel });
    }
    const repoName = repoPath?.split('/').pop() || 'unknown';
    return (_jsxs(Box, { flexDirection: "column", width: "100%", children: [_jsx(Box, { borderStyle: "single", paddingX: 1, children: _jsxs(Text, { bold: true, children: ["claude-tasks: ", repoName] }) }), _jsxs(Box, { flexGrow: 1, children: [_jsx(Box, { flexGrow: 1, flexDirection: "row", children: STATUSES.map((status, colIndex) => (_jsxs(Box, { flexDirection: "column", flexGrow: 1, borderStyle: "single", borderColor: focusedColumn === colIndex ? 'cyan' : undefined, children: [_jsx(Box, { paddingX: 1, children: _jsxs(Text, { bold: true, children: [status, " (", tasksByStatus[status].length, ")"] }) }), _jsx(Box, { flexDirection: "column", paddingX: 1, children: tasksByStatus[status].map((task, taskIndex) => {
                                        const isFocused = focusedColumn === colIndex && focusedTaskIndex[colIndex] === taskIndex;
                                        const completedTodos = task.todos.filter(t => t.completed).length;
                                        const totalTodos = task.todos.length;
                                        const indicators = [];
                                        if (task.planPath)
                                            indicators.push('[P]');
                                        if (totalTodos > 0)
                                            indicators.push(`[T ${completedTodos}/${totalTodos}]`);
                                        return (_jsx(Box, { marginY: 0, children: _jsxs(Text, { backgroundColor: isFocused ? 'cyan' : undefined, color: isFocused ? 'black' : undefined, children: [isFocused ? '> ' : '  ', task.name.slice(0, 18), indicators.length > 0 ? ` ${indicators.join(' ')}` : ''] }) }, task.id));
                                    }) })] }, status))) }), _jsxs(Box, { flexDirection: "column", width: 30, borderStyle: "single", borderColor: "gray", children: [_jsx(Box, { paddingX: 1, children: _jsx(Text, { bold: true, children: "Details" }) }), selectedTask ? (_jsxs(Box, { flexDirection: "column", paddingX: 1, children: [_jsx(Text, { bold: true, children: selectedTask.name }), _jsx(Text, { dimColor: true, children: selectedTask.status }), _jsx(Text, { children: "-------------" }), _jsx(Text, { wrap: "wrap", children: selectedTask.description }), selectedTask.planPath && (_jsxs(_Fragment, { children: [_jsx(Text, { children: "-------------" }), _jsx(Text, { dimColor: true, children: "Plan:" }), _jsx(Text, { children: selectedTask.planPath.split('/').pop() })] })), selectedTask.todos.length > 0 && (_jsxs(_Fragment, { children: [_jsx(Text, { children: "-------------" }), _jsx(Text, { dimColor: true, children: "Todos:" }), selectedTask.todos.map(todo => (_jsxs(Text, { children: [todo.completed ? '[x]' : '[ ]', " ", todo.content] }, todo.id)))] }))] })) : (_jsx(Box, { paddingX: 1, children: _jsx(Text, { dimColor: true, children: "Select a task" }) }))] })] }), _jsx(Box, { borderStyle: "single", paddingX: 1, children: _jsx(Text, { dimColor: true, children: "[n] New  [e] Edit  [arrows] Move  [d] Delete  [p] Plan  [t] Todo  [q] Quit" }) })] }));
}
//# sourceMappingURL=App.js.map