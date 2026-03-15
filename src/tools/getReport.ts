import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Config } from "../config/env.js";
import { getReportSchema } from "../schemas/report.js";
import { createReportingClient } from "../client/reporting.js";
import { toCommaSeparated } from "../utils/arrays.js";
import { mapError } from "../errors/mapError.js";

export function registerGetReport(server: McpServer, config: Config): void {
  server.registerTool(
    "yandex_metrica_get_report",
    {
      description:
        "Execute a Yandex Metrica Reporting API query and return aggregated statistics. " +
        "Use this for standard analytics: visits, pageviews, bounce rate, traffic sources, etc. " +
        "Metrics and dimensions use 'ym:s:' prefix for visits (sessions) and 'ym:pv:' for hits. " +
        "For comparison of two date ranges, use the same tool with date1b/date2b parameters (not a separate tool). " +
        "Note: Reporting API returns aggregated/sampled data; use Logs API tools for raw non-aggregated export.",
      inputSchema: getReportSchema.shape,
    },
    async (args) => {
      try {
        const client = createReportingClient(config);
        const result = await client.getReport({
          // Arrays → comma-separated strings as required by the API
          ids: args.counter_ids.join(","),
          metrics: args.metrics.join(","),
          dimensions: toCommaSeparated(args.dimensions),
          date1: args.date1,
          date2: args.date2,
          filters: args.filters,
          sort: toCommaSeparated(args.sort),
          limit: args.limit,
          offset: args.offset,
          accuracy: args.accuracy,
          currency: args.currency,
          attribution: args.attribution,
          lang: args.lang,
          include_undefined: args.include_undefined,
          preset: args.preset,
          date1b: args.date1b,
          date2b: args.date2b,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return mapError(error);
      }
    },
  );
}
