#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { TaskStorage, getRepoRoot } from '@claude-task-manage/core';
import { tools, handleToolCall } from './tools.js';
const server = new Server({ name: 'task-manager', version: '0.1.0' }, { capabilities: { tools: {} } });
const storage = new TaskStorage();
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const repoPath = await getRepoRoot();
    if (!repoPath) {
        return {
            content: [{ type: 'text', text: 'Error: Not in a git repository' }],
            isError: true,
        };
    }
    await storage.initRepo(repoPath);
    return handleToolCall(storage, repoPath, request.params.name, request.params.arguments || {});
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch(console.error);
//# sourceMappingURL=index.js.map