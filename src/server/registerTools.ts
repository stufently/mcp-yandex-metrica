import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Config } from "../config/env.js";
import { registerListCounters } from "../tools/listCounters.js";
import { registerGetCounter } from "../tools/getCounter.js";
import { registerListGoals } from "../tools/listGoals.js";
import { registerGetReport } from "../tools/getReport.js";
import { registerEvaluateLogsRequest } from "../tools/evaluateLogsRequest.js";
import { registerCreateLogsRequest } from "../tools/createLogsRequest.js";
import { registerListLogsRequests } from "../tools/listLogsRequests.js";
import { registerGetLogsRequest } from "../tools/getLogsRequest.js";
import { registerDownloadLogsPart } from "../tools/downloadLogsPart.js";
import { registerCancelLogsRequest } from "../tools/cancelLogsRequest.js";
import { registerCleanLogsRequest } from "../tools/cleanLogsRequest.js";

export function registerAllTools(server: McpServer, config: Config): void {
  registerListCounters(server, config);
  registerGetCounter(server, config);
  registerListGoals(server, config);
  registerGetReport(server, config);
  registerEvaluateLogsRequest(server, config);
  registerCreateLogsRequest(server, config);
  registerListLogsRequests(server, config);
  registerGetLogsRequest(server, config);
  registerDownloadLogsPart(server, config);
  registerCancelLogsRequest(server, config);
  registerCleanLogsRequest(server, config);
}
