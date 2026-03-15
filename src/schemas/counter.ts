import { z } from "zod";
import { counterId } from "./common.js";

export const listCountersSchema = z.object({
  page: z.number().int().min(1).optional().describe("Page number (1-based)"),
  per_page: z.number().int().min(1).max(1000).optional().describe("Items per page (max 1000)"),
  status: z.enum(["Active", "Deleted"]).optional().describe("Filter by counter status"),
  type: z.enum(["simple", "partner"]).optional().describe("Filter by counter type"),
  search: z.string().optional().describe("Search by counter name or site URL"),
  sort: z
    .enum(["Default", "Id", "Name", "Site", "Hits"])
    .optional()
    .describe("Sort order"),
});

export const getCounterSchema = z.object({
  counter_id: counterId,
});

export const listGoalsSchema = z.object({
  counter_id: counterId,
});
