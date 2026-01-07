export const tools = [
    {
        name: 'create_task',
        description: 'Create a new task with TODO status for the current git repository',
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Short name for the task' },
                description: { type: 'string', description: 'Detailed description of the task' },
            },
            required: ['name', 'description'],
        },
    },
    {
        name: 'list_tasks',
        description: 'List all tasks for the current git repository',
        inputSchema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['TODO', 'INPROGRESS', 'DONE'],
                    description: 'Filter tasks by status (optional)',
                },
            },
        },
    },
    {
        name: 'get_task',
        description: 'Get details of a specific task including its todos',
        inputSchema: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'Task ID (starts with t_)' },
            },
            required: ['id'],
        },
    },
    {
        name: 'update_task_status',
        description: 'Update the status of a task (TODO -> INPROGRESS -> DONE)',
        inputSchema: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'Task ID' },
                status: {
                    type: 'string',
                    enum: ['TODO', 'INPROGRESS', 'DONE'],
                    description: 'New status',
                },
            },
            required: ['id', 'status'],
        },
    },
    {
        name: 'update_task',
        description: 'Update task name or description',
        inputSchema: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'Task ID' },
                name: { type: 'string', description: 'New name (optional)' },
                description: { type: 'string', description: 'New description (optional)' },
            },
            required: ['id'],
        },
    },
    {
        name: 'delete_task',
        description: 'Delete a task',
        inputSchema: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'Task ID' },
            },
            required: ['id'],
        },
    },
    {
        name: 'link_plan',
        description: 'Associate a plan file with a task',
        inputSchema: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'Task ID' },
                planPath: { type: 'string', description: 'Path to plan file (e.g., ~/.claude/plans/plan.md)' },
            },
            required: ['id', 'planPath'],
        },
    },
    {
        name: 'unlink_plan',
        description: 'Remove plan association from a task',
        inputSchema: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'Task ID' },
            },
            required: ['id'],
        },
    },
    {
        name: 'add_todo',
        description: 'Add a todo item to a task',
        inputSchema: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'Task ID' },
                content: { type: 'string', description: 'Todo item content' },
            },
            required: ['id', 'content'],
        },
    },
    {
        name: 'update_todo',
        description: 'Update a todo item completion status',
        inputSchema: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'Task ID' },
                todoId: { type: 'string', description: 'Todo ID (starts with td_)' },
                completed: { type: 'boolean', description: 'Completion status' },
            },
            required: ['id', 'todoId', 'completed'],
        },
    },
    {
        name: 'delete_todo',
        description: 'Delete a todo item from a task',
        inputSchema: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'Task ID' },
                todoId: { type: 'string', description: 'Todo ID' },
            },
            required: ['id', 'todoId'],
        },
    },
];
export async function handleToolCall(storage, repoPath, toolName, args) {
    try {
        switch (toolName) {
            case 'create_task': {
                const task = await storage.createTask(repoPath, {
                    name: args.name,
                    description: args.description,
                });
                return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] };
            }
            case 'list_tasks': {
                const status = args.status;
                const tasks = await storage.getTasks(repoPath, status);
                return { content: [{ type: 'text', text: JSON.stringify(tasks, null, 2) }] };
            }
            case 'get_task': {
                const task = await storage.getTask(repoPath, args.id);
                if (!task) {
                    const allTasks = await storage.getTasks(repoPath);
                    const availableIds = allTasks.map(t => t.id).join(', ');
                    return {
                        content: [{ type: 'text', text: `Task not found: ${args.id}. Available IDs: ${availableIds || 'none'}` }],
                        isError: true,
                    };
                }
                return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] };
            }
            case 'update_task_status': {
                const task = await storage.updateTaskStatus(repoPath, args.id, args.status);
                return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] };
            }
            case 'update_task': {
                const task = await storage.updateTask(repoPath, args.id, {
                    name: args.name,
                    description: args.description,
                });
                return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] };
            }
            case 'delete_task': {
                await storage.deleteTask(repoPath, args.id);
                return { content: [{ type: 'text', text: `Task ${args.id} deleted` }] };
            }
            case 'link_plan': {
                const task = await storage.linkPlan(repoPath, args.id, args.planPath);
                return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] };
            }
            case 'unlink_plan': {
                const task = await storage.unlinkPlan(repoPath, args.id);
                return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] };
            }
            case 'add_todo': {
                const task = await storage.addTodo(repoPath, args.id, args.content);
                return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] };
            }
            case 'update_todo': {
                const task = await storage.updateTodo(repoPath, args.id, args.todoId, args.completed);
                return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] };
            }
            case 'delete_todo': {
                const task = await storage.deleteTodo(repoPath, args.id, args.todoId);
                return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] };
            }
            default:
                return { content: [{ type: 'text', text: `Unknown tool: ${toolName}` }], isError: true };
        }
    }
    catch (error) {
        return {
            content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
        };
    }
}
//# sourceMappingURL=tools.js.map