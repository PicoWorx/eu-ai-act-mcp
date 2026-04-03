#!/usr/bin/env node

/**
 * Streamable HTTP transport for Smithery / hosted deployments.
 * 
 * Start with: node dist/http.js
 * Env: PORT (default 3000)
 * 
 * Runs in stateless mode - each request is independent, no session tracking.
 * This is simpler and works well for our read-only knowledge base tools.
 */

import { createServer } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerClassifyTool } from "./tools/classify.js";
import { registerDeadlinesTool } from "./tools/deadlines.js";
import { registerObligationsTool } from "./tools/obligations.js";
import { registerFaqTool } from "./tools/faq.js";
import { registerPenaltiesTool } from "./tools/penalties.js";

const PORT = parseInt(process.env.PORT || "3000", 10);

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "lexbeam-eu-ai-act-mcp-server",
    version: "1.0.0",
  });
  registerClassifyTool(server);
  registerDeadlinesTool(server);
  registerObligationsTool(server);
  registerFaqTool(server);
  registerPenaltiesTool(server);
  return server;
}

const httpServer = createServer(async (req, res) => {
  // CORS headers for Smithery proxy
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, mcp-session-id");
  res.setHeader("Access-Control-Expose-Headers", "mcp-session-id");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", server: "lexbeam-eu-ai-act-mcp", version: "1.0.0" }));
    return;
  }

  // MCP endpoint
  if (req.url === "/mcp") {
    // Stateless: create a fresh transport + server per request
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless mode
    });

    const server = createMcpServer();
    await server.connect(transport);

    await transport.handleRequest(req, res);
    return;
  }

  // Fallback: 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found. Use /mcp for the MCP endpoint or /health for status." }));
});

httpServer.listen(PORT, () => {
  console.log(`EU AI Act MCP Server (HTTP) listening on port ${PORT}`);
  console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
