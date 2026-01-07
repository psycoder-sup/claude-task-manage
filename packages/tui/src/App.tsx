import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { Task, TaskStatus } from '@claude-task-manage/core';
import { useTasks } from './hooks/useTasks.js';
import { CreateTaskForm } from './components/CreateTaskForm.js';
import { EditTaskForm } from './components/EditTaskForm.js';
import { AddTodoForm } from './components/AddTodoForm.js';

interface AppProps {
  repoPath?: string;
}

type Mode = 'normal' | 'create' | 'edit' | 'add-todo';

const STATUSES: TaskStatus[] = ['TODO', 'INPROGRESS', 'DONE'];

export function App({ repoPath: initialRepoPath }: AppProps) {
  const { exit } = useApp();
  const { repoPath, tasks, loading, error, createTask, updateTask, updateStatus, deleteTask, addTodo } = useTasks(initialRepoPath);

  const [mode, setMode] = useState<Mode>('normal');
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
