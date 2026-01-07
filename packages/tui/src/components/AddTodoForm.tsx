import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';

interface AddTodoFormProps {
  taskName: string;
  onSubmit: (content: string) => void;
  onCancel: () => void;
}

export function AddTodoForm({ taskName, onSubmit, onCancel }: AddTodoFormProps) {
  const [content, setContent] = useState('');

  useInput((_, key) => {
    if (key.escape) onCancel();
  });

  const handleSubmit = () => {
    if (content.trim()) onSubmit(content.trim());
  };

  return (
    <Box flexDirection="column" borderStyle="single" padding={1}>
      <Text bold>Add Todo to: {taskName}</Text>
      <Text dimColor>(Esc to cancel)</Text>
      <Box marginTop={1}>
        <Text>Todo: </Text>
        <TextInput value={content} onChange={setContent} onSubmit={handleSubmit} />
      </Box>
    </Box>
  );
}
