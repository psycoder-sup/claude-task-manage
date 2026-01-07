import { Task } from '@claude-task-manage/core';
interface EditTaskFormProps {
    task: Task;
    onSubmit: (name: string, description: string) => void;
    onCancel: () => void;
}
export declare function EditTaskForm({ task, onSubmit, onCancel }: EditTaskFormProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=EditTaskForm.d.ts.map