#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './App.js';

const args = process.argv.slice(2);
let repoPath: string | undefined;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--repo' && args[i + 1]) {
    repoPath = args[i + 1];
    break;
  }
}

render(<App repoPath={repoPath} />);
