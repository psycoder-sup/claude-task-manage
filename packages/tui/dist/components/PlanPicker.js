import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
export function PlanPicker({ onSelect, onCancel }) {
    const [files, setFiles] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function loadFiles() {
            const plansDir = path.join(os.homedir(), '.claude', 'plans');
            try {
                const entries = await fs.readdir(plansDir);
                const mdFiles = entries.filter(f => f.endsWith('.md'));
                setFiles(mdFiles);
            }
            catch {
                setFiles([]);
            }
            setLoading(false);
        }
        loadFiles();
    }, []);
    useInput((input, key) => {
        if (key.escape) {
            onCancel();
        }
        else if (key.upArrow || input === 'k') {
            setSelectedIndex(prev => Math.max(0, prev - 1));
        }
        else if (key.downArrow || input === 'j') {
            setSelectedIndex(prev => Math.min(files.length - 1, prev + 1));
        }
        else if (key.return && files[selectedIndex]) {
            const fullPath = path.join('~/.claude/plans', files[selectedIndex]);
            onSelect(fullPath);
        }
    });
    if (loading)
        return _jsx(Text, { children: "Loading plans..." });
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "single", padding: 1, children: [_jsx(Text, { bold: true, children: "Select Plan" }), _jsx(Text, { dimColor: true, children: "(Esc to cancel)" }), files.length === 0 ? (_jsx(Text, { dimColor: true, children: "No plans found in ~/.claude/plans/" })) : (files.map((file, idx) => (_jsxs(Text, { backgroundColor: idx === selectedIndex ? 'cyan' : undefined, color: idx === selectedIndex ? 'black' : undefined, children: [idx === selectedIndex ? '> ' : '  ', file] }, file))))] }));
}
//# sourceMappingURL=PlanPicker.js.map