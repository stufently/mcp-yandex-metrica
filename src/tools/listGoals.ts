import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Config } from "../config/env.js";
import { listGoalsSchema } from "../schemas/counter.js";
import { createManagementClient } from "../client/management.js";
import { mapError } from "../errors/mapError.js";

export function registerListGoals(server: McpServer, config: Config): void {
  server.registerTool(
    "yandex_metrica_list_goals",
    {
      description:
        "List conversion goals configured for a Yandex Metrica counter. " +
        "Goals are useful for filtering and segmenting Reporting API queries (e.g. metrics like ym:s:goal<ID>conversionRate).",
      inputSchema: listGoalsSchema.shape,
    },
    async (args) => {
      try {
        const client = createManagementClient(config);
        const result = await client.listGoals({ counter_id: args.counter_id });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return mapError(error);
      }
    },
  );
}
