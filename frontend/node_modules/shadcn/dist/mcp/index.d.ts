import { McpServer } from '@modelcontextprotocol/server';

/**
 * Create a new shadcn MCP server with every tool registered. Each
 * connection should get its own instance.
 */
declare function createServer(): McpServer;
declare const server: McpServer;

export { createServer, server };
