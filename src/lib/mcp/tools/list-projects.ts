import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { toolError } from "../errors";

export default defineTool({
  name: "list_projects",
  title: "List portfolio projects",
  description: "List portfolio projects with their status, tech stack, and links, ordered as shown on the site.",
  inputSchema: {
    status: z.string().trim().optional().describe("Filter by status, e.g. 'live' or 'in-progress'."),
    limit: z.number().int().min(1).max(50).optional().describe("Max projects to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let query = supabaseForUser(ctx)
      .from("projects")
      .select("id, title, description, status, tech, github, demo, display_order")
      .order("display_order", { ascending: true })
      .limit(limit ?? 20);

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) return toolError("list-projects", error);

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { projects: data ?? [] },
    };
  },
});
