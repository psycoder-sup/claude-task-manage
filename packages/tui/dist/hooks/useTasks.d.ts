import { TaskStatus } from '@claude-task-manage/core';
export declare function useTasks(initialRepoPath?: string): {
    repoPath: string | null;
    tasks: {
        status: "TODO" | "INPROGRESS" | "DONE";
        id: string;
        name: string;
        description: string;
        todos: {
            id: string;
            content: string;
            completed: boolean;
        }[];
        createdAt: string;
        updatedAt: string;
        planPath?: string | undefined;
    }[];
    loading: boolean;
    error: string | null;
    createTask: (name: string, description: string) => Promise<{
        status: "TODO" | "INPROGRESS" | "DONE";
        id: string;
        name: string;
        description: string;
        todos: {
            id: string;
            content: string;
            completed: boolean;
        }[];
        createdAt: string;
        updatedAt: string;
        planPath?: string | undefined;
    } | undefined>;
    updateStatus: (taskId: string, status: TaskStatus) => Promise<{
        status: "TODO" | "INPROGRESS" | "DONE";
        id: string;
        name: string;
        description: string;
        todos: {
            id: string;
            content: string;
            completed: boolean;
        }[];
        createdAt: string;
        updatedAt: string;
        planPath?: string | undefined;
    } | undefined>;
    updateTask: (taskId: string, name?: string, description?: string) => Promise<{
        status: "TODO" | "INPROGRESS" | "DONE";
        id: string;
        name: string;
        description: string;
        todos: {
            id: string;
            content: string;
            completed: boolean;
        }[];
        createdAt: string;
        updatedAt: string;
        planPath?: string | undefined;
    } | undefined>;
    deleteTask: (taskId: string) => Promise<void>;
    linkPlan: (taskId: string, planPath: string) => Promise<{
        status: "TODO" | "INPROGRESS" | "DONE";
        id: string;
        name: string;
        description: string;
        todos: {
            id: string;
            content: string;
            completed: boolean;
        }[];
        createdAt: string;
        updatedAt: string;
        planPath?: string | undefined;
    } | undefined>;
    addTodo: (taskId: string, content: string) => Promise<{
        status: "TODO" | "INPROGRESS" | "DONE";
        id: string;
        name: string;
        description: string;
        todos: {
            id: string;
            content: string;
            completed: boolean;
        }[];
        createdAt: string;
        updatedAt: string;
        planPath?: string | undefined;
    } | undefined>;
    updateTodo: (taskId: string, todoId: string, completed: boolean) => Promise<{
        status: "TODO" | "INPROGRESS" | "DONE";
        id: string;
        name: string;
        description: string;
        todos: {
            id: string;
            content: string;
            completed: boolean;
        }[];
        createdAt: string;
        updatedAt: string;
        planPath?: string | undefined;
    } | undefined>;
    deleteTodo: (taskId: string, todoId: string) => Promise<{
        status: "TODO" | "INPROGRESS" | "DONE";
        id: string;
        name: string;
        description: string;
        todos: {
            id: string;
            content: string;
            completed: boolean;
        }[];
        createdAt: string;
        updatedAt: string;
        planPath?: string | undefined;
    } | undefined>;
};
//# sourceMappingURL=useTasks.d.ts.map