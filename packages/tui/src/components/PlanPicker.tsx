import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

interface PlanPickerProps {
  onSelect: (planPath: string) => void;
  onCancel: () => void;
}

export function PlanPicker({ onSelect, onCancel }: PlanPickerProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFiles() {
      const plansDir = path.join(os.homedir(), '.claude', 'plans');
      try {
        const entries = await fs.readdir(plansDir);
        const mdFiles = entries.filter(f => f.endsWith('.md'));
        setFiles(mdFiles);
      } catch {
        setFiles([]);
      }
      setLoading(false);
    }
    loadFiles();
  }, []);

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
    } else if (key.upArrow || input === 'k') {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    } else if (key.downArrow || input === 'j') {
      setSelectedIndex(prev => Math.min(files.length - 1, prev + 1));
    } else if (key.return && files[selectedIndex]) {
      const fullPath = path.join('~/.claude/plans', files[selectedIndex]);
      onSelect(fullPath);
    }
  });

  if (loading) return <Text>Loading plans...</Text>;

  return (
    <Box flexDirection="column" borderStyle="single" padding={1}>
      <Text bold>Select Plan</Text>
      <Text dimColor>(Esc to cancel)</Text>
      {files.length === 0 ? (
        <Text dimColor>No plans found in ~/.claude/plans/</Text>
      ) : (
        files.map((file, idx) => (
          <Text key={file} backgroundColor={idx === selectedIndex ? 'cyan' : undefined} color={idx === selectedIndex ? 'black' : undefined}>
            {idx === selectedIndex ? '> ' : '  '}{file}
          </Text>
        ))
      )}
    </Box>
  );
}
