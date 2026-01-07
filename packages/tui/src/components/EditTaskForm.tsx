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
