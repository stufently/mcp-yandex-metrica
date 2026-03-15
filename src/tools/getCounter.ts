import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Config } from "../config/env.js";
import { getCounterSchema } from "../schemas/counter.js";
import { createManagementClient } from "../client/management.js";
import { mapError } from "../errors/mapError.js";

export function registerGetCounter(server: McpServer, config: Config): void {
  server.registerTool(
    "yandex_metrica_get_counter",
    {
      description:
        "Get detailed information about a specific Yandex Metrica counter by its ID. " +
        "Returns counter settings, status, owner, timezone, and configuration.",
      inputSchema: getCounterSchema.shape,
    },
    async (args) => {
      try {
        const client = createManagementClient(config);
        const result = await client.getCounter({ counter_id: args.counter_id });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return mapError(error);
      }
    },
  );
}
