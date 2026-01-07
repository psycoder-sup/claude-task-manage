import { Task, TaskStatus, IndexFile } from './types.js';
export interface CreateTaskInput {
    name: string;
    description: string;
}
export interface UpdateTaskInput {
    name?: string;
    description?: string;
}
export declare class TaskStorage {
    private baseDir;
    constructor(baseDir?: string);
    private ensureDir;
    private getIndexPath;
    private getTasksDir;
    private getTasksPath;
    getIndex(): Promise<IndexFile>;
    private saveIndex;
    initRepo(repoPath: string): Promise<void>;
    private readTasksFile;
    private writeTasksFile;
    private withLock;
    getTasks(repoPath: string, status?: TaskStatus): Promise<Task[]>;
    getTask(repoPath: string, taskId: string): Promise<Task | null>;
    createTask(repoPath: string, input: CreateTaskInput): Promise<Task>;
    updateTask(repoPath: string, taskId: string, input: UpdateTaskInput): Promise<Task>;
    updateTaskStatus(repoPath: string, taskId: string, status: TaskStatus): Promise<Task>;
    deleteTask(repoPath: string, taskId: string): Promise<void>;
    linkPlan(repoPath: string, taskId: string, planPath: string): Promise<Task>;
    unlinkPlan(repoPath: string, taskId: string): Promise<Task>;
    addTodo(repoPath: string, taskId: string, content: string): Promise<Task>;
    updateTodo(repoPath: string, taskId: string, todoId: string, completed: boolean): Promise<Task>;
    deleteTodo(repoPath: string, taskId: string, todoId: string): Promise<Task>;
}
//# sourceMappingURL=storage.d.ts.map