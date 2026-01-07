import { z } from 'zod';

export const TaskStatus = z.enum(['TODO', 'INPROGRESS', 'DONE']);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const TodoSchema = z.object({
  id: z.string().startsWith('td_'),
  content: z.string().min(1),
  completed: z.boolean(),
});

export type Todo = z.infer<typeof TodoSchema>;

export const TaskSchema = z.object({
  id: z.string().startsWith('t_'),
  name: z.string().min(1),
  description: z.string().min(1),
  status: TaskStatus,
  planPath: z.string().optional(),
  todos: z.array(TodoSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Task = z.infer<typeof TaskSchema>;

export const TasksFileSchema = z.object({
  repoPath: z.string(),
  tasks: z.array(TaskSchema),
});

export type TasksFile = z.infer<typeof TasksFileSchema>;

export const IndexFileSchema = z.object({
  repos: z.record(z.string(), z.string()),
});

export type IndexFile = z.infer<typeof IndexFileSchema>;
