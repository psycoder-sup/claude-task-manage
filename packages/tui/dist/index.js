#!/usr/bin/env node
import { jsx as _jsx } from "react/jsx-runtime";
import { render } from 'ink';
import { App } from './App.js';
const args = process.argv.slice(2);
let repoPath;
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--repo' && args[i + 1]) {
        repoPath = args[i + 1];
        break;
    }
}
render(_jsx(App, { repoPath: repoPath }));
//# sourceMappingURL=index.js.map