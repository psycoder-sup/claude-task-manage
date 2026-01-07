import { z } from 'zod';
export declare const TaskStatus: z.ZodEnum<["TODO", "INPROGRESS", "DONE"]>;
export type TaskStatus = z.infer<typeof TaskStatus>;
export declare const TodoSchema: z.ZodObject<{
    id: z.ZodString;
    content: z.ZodString;
    completed: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    content: string;
    completed: boolean;
}, {
    id: string;
    content: string;
    completed: boolean;
}>;
export type Todo = z.infer<typeof TodoSchema>;
export declare const TaskSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    status: z.ZodEnum<["TODO", "INPROGRESS", "DONE"]>;
    planPath: z.ZodOptional<z.ZodString>;
    todos: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        content: z.ZodString;
        completed: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: string;
        content: string;
        completed: boolean;
    }, {
        id: string;
        content: string;
        completed: boolean;
    }>, "many">;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
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
}, {
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
}>;
export type Task = z.infer<typeof TaskSchema>;
export declare const TasksFileSchema: z.ZodObject<{
    repoPath: z.ZodString;
    tasks: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        status: z.ZodEnum<["TODO", "INPROGRESS", "DONE"]>;
        planPath: z.ZodOptional<z.ZodString>;
        todos: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            content: z.ZodString;
            completed: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            id: string;
            content: string;
            completed: boolean;
        }, {
            id: string;
            content: string;
            completed: boolean;
        }>, "many">;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
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
    }, {
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
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    repoPath: string;
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
}, {
    repoPath: string;
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
}>;
export type TasksFile = z.infer<typeof TasksFileSchema>;
export declare const IndexFileSchema: z.ZodObject<{
    repos: z.ZodRecord<z.ZodString, z.ZodString>;
}, "strip", z.ZodTypeAny, {
    repos: Record<string, string>;
}, {
    repos: Record<string, string>;
}>;
export type IndexFile = z.infer<typeof IndexFileSchema>;
//# sourceMappingURL=types.d.ts.map