import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { toolError } from "../errors";

export default defineTool({
  name: "list_blog_posts",
  title: "List blog posts",
  description:
    "List published blog posts, newest first. Optionally filter by category or a title/excerpt search term.",
  inputSchema: {
    search: z.string().trim().optional().describe("Match against title and excerpt."),
    category: z.string().trim().optional().describe("Exact category name, e.g. 'Security'."),
    limit: z.number().int().min(1).max(50).optional().describe("Max posts to return (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, category, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let query = supabaseForUser(ctx)
      .from("blog_posts")
      .select("id, title, excerpt, category, read_time, date, cover_image")
      .order("date", { ascending: false })
      .limit(limit ?? 10);

    if (category) query = query.eq("category", category);
    if (search) query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) return toolError("list-blog-posts", error);

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { posts: data ?? [] },
    };
  },
});
