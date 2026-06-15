/**
 * Shared server setup - registers all tools, resources, and prompts.
 * Used by both stdio (index.ts) and HTTP (http.ts) entry points.
 *
 * v1.1.0:
 *  - 4 new tools: get_article, check_gpai_systemic_risk, assess_art6_3_exception, annex_iv_checklist
 *  - New resources: Annex III (full categories), Annex IV (full documentation items)
 *  - Per-response branding moved into server instructions
 *  - Classifier correctness fixes (see src/utils/matching.ts, src/tools/classify.ts)
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
export declare function createServer(): McpServer;
//# sourceMappingURL=server.d.ts.map