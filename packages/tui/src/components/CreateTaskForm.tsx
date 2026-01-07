import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';

interface CreateTaskFormProps {
  onSubmit: (name: string, description: string) => void;
  onCancel: () => void;
}

export function CreateTaskForm({ onSubmit, onCancel }: CreateTaskFormProps) {
  const [step, setStep] = useState<'name' | 'description'>('name');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useInput((_, key) => {
    if (key.escape) onCancel();
  });

  const handleNameSubmit = () => {
    if (name.trim()) setStep('description');
  };

  const handleDescriptionSubmit = () => {
    if (description.trim()) onSubmit(name.trim(), description.trim());
  };

  return (
    <Box flexDirection="column" borderStyle="single" padding={1}>
      <Text bold>Create New Task</Text>
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
