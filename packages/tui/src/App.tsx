import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { Task, TaskStatus } from '@claude-task-manage/core';
import { useTasks } from './hooks/useTasks.js';
import { CreateTaskForm } from './components/CreateTaskForm.js';
import { EditTaskForm } from './components/EditTaskForm.js';
import { AddTodoForm } from './components/AddTodoForm.js';
import { PlanPicker } from './components/PlanPicker.js';

interface AppProps {
  repoPath?: string;
}

type Mode = 'normal' | 'create' | 'edit' | 'add-todo' | 'link-plan';

const STATUSES: TaskStatus[] = ['TODO', 'INPROGRESS', 'DONE'];

export function App({ repoPath: initialRepoPath }: AppProps) {
  const { exit } = useApp();
  const { repoPath, tasks, loading, error, createTask, updateTask, updateStatus, deleteTask, addTodo, linkPlan } = useTasks(initialRepoPath);

  const [mode, setMode] = useState<Mode>('normal');
  const [focusedColumn, setFocusedColumn] = useState(0);
  const [focusedTaskIndex, setFocusedTaskIndex] = useState<Record<number, number>>({ 0: 0, 1: 0, 2: 0 });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
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
    if (mode !== 'normal') return;

    if (input === 'q') {
      exit();
      return;
    }

    const currentTask = getCurrentTask();

    if (input === 'n') {
      setMode('create');
    } else if (input === 'e' && currentTask) {
      setSelectedTask(currentTask);
      setMode('edit');
    } else if (input === 't' && currentTask) {
      setSelectedTask(currentTask);
      setMode('add-todo');
    } else if (input === 'p' && currentTask) {
      setSelectedTask(currentTask);
      setMode('link-plan');
    } else if (key.leftArrow || input === 'h') {
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
      const newIndex = Math.max(0, (focusedTaskIndex[focusedColumn] || 0) - 1);
      setFocusedTaskIndex(prev => ({
        ...prev,
        [focusedColumn]: newIndex,
      }));
      const currentStatus = STATUSES[focusedColumn];
      setSelectedTask(tasksByStatus[currentStatus][newIndex] || null);
    } else if (key.downArrow || input === 'j') {
      const currentStatus = STATUSES[focusedColumn];
      const maxIndex = tasksByStatus[currentStatus].length - 1;
      const newIndex = Math.min(maxIndex, (focusedTaskIndex[focusedColumn] || 0) + 1);
      setFocusedTaskIndex(prev => ({
        ...prev,
        [focusedColumn]: newIndex,
      }));
      setSelectedTask(tasksByStatus[currentStatus][newIndex] || null);
    } else if (key.tab) {
      const newColumn = (focusedColumn + 1) % 3;
      setFocusedColumn(newColumn);
      // Auto-select the focused task in the new column
      const newStatus = STATUSES[newColumn];
      const tasksInNewColumn = tasksByStatus[newStatus];
      const taskIndex = focusedTaskIndex[newColumn] || 0;
      setSelectedTask(tasksInNewColumn[taskIndex] || null);
    } else if (input === 'd' && currentTask) {
      deleteTask(currentTask.id);
    } else if (key.return && currentTask) {
      setSelectedTask(selectedTask?.id === currentTask.id ? null : currentTask);
    }
  });

  const handleCreateSubmit = async (name: string, description: string) => {
    await createTask(name, description);
    setMode('normal');
  };

  const handleEditSubmit = async (name: string, description: string) => {
    if (selectedTask) {
      await updateTask(selectedTask.id, name, description);
    }
    setMode('normal');
  };

  const handleAddTodoSubmit = async (content: string) => {
    if (selectedTask) {
      await addTodo(selectedTask.id, content);
    }
    setMode('normal');
  };

  const handleLinkPlanSubmit = async (planPath: string) => {
    if (selectedTask) {
      await linkPlan(selectedTask.id, planPath);
    }
    setMode('normal');
  };

  const handleCancel = () => {
    setMode('normal');
  };

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text color="red">Error: {error}</Text>;

  if (mode === 'create') {
    return <CreateTaskForm onSubmit={handleCreateSubmit} onCancel={handleCancel} />;
  }

  if (mode === 'edit' && selectedTask) {
    return <EditTaskForm task={selectedTask} onSubmit={handleEditSubmit} onCancel={handleCancel} />;
  }

  if (mode === 'add-todo' && selectedTask) {
    return <AddTodoForm taskName={selectedTask.name} onSubmit={handleAddTodoSubmit} onCancel={handleCancel} />;
  }

  if (mode === 'link-plan' && selectedTask) {
    return <PlanPicker onSelect={handleLinkPlanSubmit} onCancel={handleCancel} />;
  }

  const repoName = repoPath?.split('/').pop() || 'unknown';

  // Calculate dynamic title width based on terminal width
  const detailsPanelWidth = 30;
  const borderPadding = 12; // borders + padding for 3 columns
  const availableWidth = terminalWidth - detailsPanelWidth - borderPadding;
  const columnWidth = Math.floor(availableWidth / 3);
  const titleMaxLength = Math.max(10, columnWidth - 15); // reserve space for indicators like [P] [T x/y]

  return (
    <Box flexDirection="column" width="100%" height={terminalHeight}>
      <Box borderStyle="single" paddingX={1}>
        <Text bold>claude-tasks: {repoName}</Text>
      </Box>

      <Box flexGrow={1}>
        <Box flexGrow={1} flexDirection="row">
          {STATUSES.map((status, colIndex) => {
            const statusColors: Record<TaskStatus, string> = {
              TODO: 'yellow',
              INPROGRESS: 'blue',
              DONE: 'green',
            };
            const columnColor = statusColors[status];
            const isFocused = focusedColumn === colIndex;

            return (
            <Box
              key={status}
              flexDirection="column"
              flexGrow={1}
              borderStyle={isFocused ? 'double' : 'single'}
              borderColor={isFocused ? 'cyan' : columnColor}
            >
              <Box paddingX={1}>
                <Text bold color={columnColor}>{status} ({tasksByStatus[status].length})</Text>
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
                        {task.name.length > titleMaxLength
                          ? task.name.slice(0, titleMaxLength - 1) + '…'
                          : task.name}
                        {indicators.length > 0 ? ` ${indicators.join(' ')}` : ''}
                      </Text>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
          })}
        </Box>

        <Box flexDirection="column" width={30} borderStyle="single" borderColor="magenta">
          <Box paddingX={1}><Text bold color="magenta">Details</Text></Box>
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
