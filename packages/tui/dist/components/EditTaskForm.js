import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
export function EditTaskForm({ task, onSubmit, onCancel }) {
    const [step, setStep] = useState('name');
    const [name, setName] = useState(task.name);
    const [description, setDescription] = useState(task.description);
    useInput((_, key) => {
        if (key.escape)
            onCancel();
    });
    const handleNameSubmit = () => setStep('description');
    const handleDescriptionSubmit = () => {
        if (name.trim() && description.trim()) {
            onSubmit(name.trim(), description.trim());
        }
    };
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "single", padding: 1, children: [_jsx(Text, { bold: true, children: "Edit Task" }), _jsx(Text, { dimColor: true, children: "(Esc to cancel)" }), _jsxs(Box, { marginTop: 1, children: [_jsx(Text, { children: "Name: " }), step === 'name' ? (_jsx(TextInput, { value: name, onChange: setName, onSubmit: handleNameSubmit })) : (_jsx(Text, { children: name }))] }), step === 'description' && (_jsxs(Box, { marginTop: 1, children: [_jsx(Text, { children: "Description: " }), _jsx(TextInput, { value: description, onChange: setDescription, onSubmit: handleDescriptionSubmit })] }))] }));
}
//# sourceMappingURL=EditTaskForm.js.map