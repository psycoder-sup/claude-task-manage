import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
export function AddTodoForm({ taskName, onSubmit, onCancel }) {
    const [content, setContent] = useState('');
    useInput((_, key) => {
        if (key.escape)
            onCancel();
    });
    const handleSubmit = () => {
        if (content.trim())
            onSubmit(content.trim());
    };
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "single", padding: 1, children: [_jsxs(Text, { bold: true, children: ["Add Todo to: ", taskName] }), _jsx(Text, { dimColor: true, children: "(Esc to cancel)" }), _jsxs(Box, { marginTop: 1, children: [_jsx(Text, { children: "Todo: " }), _jsx(TextInput, { value: content, onChange: setContent, onSubmit: handleSubmit })] })] }));
}
//# sourceMappingURL=AddTodoForm.js.map