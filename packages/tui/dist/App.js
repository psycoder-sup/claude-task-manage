import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { useTasks } from './hooks/useTasks.js';
import { CreateTaskForm } from './components/CreateTaskForm.js';
import { EditTaskForm } from './components/EditTaskForm.js';
import { AddTodoForm } from './components/AddTodoForm.js';
import { PlanPicker } from './components/PlanPicker.js';
const STATUSES = ['TODO', 'INPROGRESS', 'DONE'];
export function App({ repoPath: initialRepoPath }) {
    const { exit } = useApp();
    const { repoPath, tasks, loading, error, createTask, updateTask, updateStatus, deleteTask, addTodo, linkPlan } = useTasks(initialRepoPath);
    const [mode, setMode] = useState('normal');
    const [focusedColumn, setFocusedColumn] = useState(0);
    const [focusedTaskIndex, setFocusedTaskIndex] = useState({ 0: 0, 1: 0, 2: 0 });
    const [selectedTask, setSelectedTask] = useState(null);
    const [terminalHeight, setTerminalHeight] = useState(process.stdout.rows);
    const [terminalWidth, setTerminalWidth] = useState(process.stdout.columns);
    useEffect(() => {
        const handleResize = () => {
            setTerminalHeight(process.stdout.rows);
            setTerminalWidth(process.stdout.columns);
        };
        process.stdout.on('resize', handleResize);
        return () => {
            process.stdout.off('resize', handleResize);
        };
    }, []);
    // Auto-select the first task in the focused column on initial load
    useEffect(() => {
        if (selectedTask === null && tasks.length > 0) {
            const initialStatus = STATUSES[focusedColumn];
            const tasksInColumn = tasks.filter(t => t.status === initialStatus);
            if (tasksInColumn.length > 0) {
                setSelectedTask(tasksInColumn[0]);
            }
        }
    }, [tasks, selectedTask, focusedColumn]);
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
        else if (input === 't' && currentTask) {
            setSelectedTask(currentTask);
            setMode('add-todo');
        }
        else if (input === 'p' && currentTask) {
            setSelectedTask(currentTask);
            setMode('link-plan');
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
            const newIndex = Math.max(0, (focusedTaskIndex[focusedColumn] || 0) - 1);
            setFocusedTaskIndex(prev => ({
                ...prev,
                [focusedColumn]: newIndex,
            }));
            const currentStatus = STATUSES[focusedColumn];
            setSelectedTask(tasksByStatus[currentStatus][newIndex] || null);
        }
        else if (key.downArrow || input === 'j') {
            const currentStatus = STATUSES[focusedColumn];
            const maxIndex = tasksByStatus[currentStatus].length - 1;
            const newIndex = Math.min(maxIndex, (focusedTaskIndex[focusedColumn] || 0) + 1);
            setFocusedTaskIndex(prev => ({
                ...prev,
                [focusedColumn]: newIndex,
            }));
            setSelectedTask(tasksByStatus[currentStatus][newIndex] || null);
        }
        else if (key.tab) {
            const newColumn = (focusedColumn + 1) % 3;
            setFocusedColumn(newColumn);
            // Auto-select the focused task in the new column
            const newStatus = STATUSES[newColumn];
            const tasksInNewColumn = tasksByStatus[newStatus];
            const taskIndex = focusedTaskIndex[newColumn] || 0;
            setSelectedTask(tasksInNewColumn[taskIndex] || null);
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
    const handleAddTodoSubmit = async (content) => {
        if (selectedTask) {
            await addTodo(selectedTask.id, content);
        }
        setMode('normal');
    };
    const handleLinkPlanSubmit = async (planPath) => {
        if (selectedTask) {
            await linkPlan(selectedTask.id, planPath);
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
    if (mode === 'add-todo' && selectedTask) {
        return _jsx(AddTodoForm, { taskName: selectedTask.name, onSubmit: handleAddTodoSubmit, onCancel: handleCancel });
    }
    if (mode === 'link-plan' && selectedTask) {
        return _jsx(PlanPicker, { onSelect: handleLinkPlanSubmit, onCancel: handleCancel });
    }
    const repoName = repoPath?.split('/').pop() || 'unknown';
    // Calculate dynamic title width based on terminal width
    const detailsPanelWidth = 30;
    const borderPadding = 12; // borders + padding for 3 columns
    const availableWidth = terminalWidth - detailsPanelWidth - borderPadding;
    const columnWidth = Math.floor(availableWidth / 3);
    const titleMaxLength = Math.max(10, columnWidth - 15); // reserve space for indicators like [P] [T x/y]
    return (_jsxs(Box, { flexDirection: "column", width: "100%", height: terminalHeight, children: [_jsx(Box, { borderStyle: "single", paddingX: 1, children: _jsxs(Text, { bold: true, children: ["claude-tasks: ", repoName] }) }), _jsxs(Box, { flexGrow: 1, children: [_jsx(Box, { flexGrow: 1, flexDirection: "row", children: STATUSES.map((status, colIndex) => {
                            const statusColors = {
                                TODO: 'yellow',
                                INPROGRESS: 'blue',
                                DONE: 'green',
                            };
                            const columnColor = statusColors[status];
                            const isFocused = focusedColumn === colIndex;
                            return (_jsxs(Box, { flexDirection: "column", flexGrow: 1, borderStyle: isFocused ? 'double' : 'single', borderColor: isFocused ? 'cyan' : columnColor, children: [_jsx(Box, { paddingX: 1, children: _jsxs(Text, { bold: true, color: columnColor, children: [status, " (", tasksByStatus[status].length, ")"] }) }), _jsx(Box, { flexDirection: "column", paddingX: 1, children: tasksByStatus[status].map((task, taskIndex) => {
                                            const isFocused = focusedColumn === colIndex && focusedTaskIndex[colIndex] === taskIndex;
                                            const completedTodos = task.todos.filter(t => t.completed).length;
                                            const totalTodos = task.todos.length;
                                            const indicators = [];
                                            if (task.planPath)
                                                indicators.push('[P]');
                                            if (totalTodos > 0)
                                                indicators.push(`[T ${completedTodos}/${totalTodos}]`);
                                            return (_jsx(Box, { marginY: 0, children: _jsxs(Text, { backgroundColor: isFocused ? 'cyan' : undefined, color: isFocused ? 'black' : undefined, children: [isFocused ? '> ' : '  ', task.name.length > titleMaxLength
                                                            ? task.name.slice(0, titleMaxLength - 1) + '…'
                                                            : task.name, indicators.length > 0 ? ` ${indicators.join(' ')}` : ''] }) }, task.id));
                                        }) })] }, status));
                        }) }), _jsxs(Box, { flexDirection: "column", width: 30, borderStyle: "single", borderColor: "magenta", children: [_jsx(Box, { paddingX: 1, children: _jsx(Text, { bold: true, color: "magenta", children: "Details" }) }), selectedTask ? (_jsxs(Box, { flexDirection: "column", paddingX: 1, children: [_jsx(Text, { bold: true, children: selectedTask.name }), _jsx(Text, { dimColor: true, children: selectedTask.status }), _jsx(Text, { children: "-------------" }), _jsx(Text, { wrap: "wrap", children: selectedTask.description }), selectedTask.planPath && (_jsxs(_Fragment, { children: [_jsx(Text, { children: "-------------" }), _jsx(Text, { dimColor: true, children: "Plan:" }), _jsx(Text, { children: selectedTask.planPath.split('/').pop() })] })), selectedTask.todos.length > 0 && (_jsxs(_Fragment, { children: [_jsx(Text, { children: "-------------" }), _jsx(Text, { dimColor: true, children: "Todos:" }), selectedTask.todos.map(todo => (_jsxs(Text, { children: [todo.completed ? '[x]' : '[ ]', " ", todo.content] }, todo.id)))] }))] })) : (_jsx(Box, { paddingX: 1, children: _jsx(Text, { dimColor: true, children: "Select a task" }) }))] })] }), _jsx(Box, { borderStyle: "single", paddingX: 1, children: _jsx(Text, { dimColor: true, children: "[n] New  [e] Edit  [arrows] Move  [d] Delete  [p] Plan  [t] Todo  [q] Quit" }) })] }));
}
//# sourceMappingURL=App.js.map