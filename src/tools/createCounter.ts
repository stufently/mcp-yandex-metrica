import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Config } from "../config/env.js";
import { createCounterSchema } from "../schemas/counter.js";
import { createManagementClient } from "../client/management.js";
import { mapError } from "../errors/mapError.js";

export function registerCreateCounter(server: McpServer, config: Config): void {
  server.registerTool(
    "yandex_metrica_create_counter",
    {
      description:
        "Create a new Yandex Metrica counter (add a site for tracking). " +
        "Returns the created counter with its ID and tracking code.",
      inputSchema: createCounterSchema.shape,
    },
    async (args) => {
      try {
        const client = createManagementClient(config);
        const result = await client.createCounter({
          name: args.name,
          site: args.site,
          mirrors: args.mirrors,
          time_zone_name: args.time_zone_name,
          gdpr_agreement_accepted: args.gdpr_agreement_accepted,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return mapError(error);
      }
    },
  );
}
