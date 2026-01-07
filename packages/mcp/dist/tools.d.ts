import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { TaskStorage } from '@claude-task-manage/core';
export declare const tools: Tool[];
export declare function handleToolCall(storage: TaskStorage, repoPath: string, toolName: string, args: Record<string, unknown>): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
    isError?: boolean;
}>;
//# sourceMappingURL=tools.d.ts.map