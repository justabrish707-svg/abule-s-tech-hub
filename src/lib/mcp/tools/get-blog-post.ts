import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { toolError } from "../errors";

export default defineTool({
  name: "get_blog_post",
  title: "Get blog post",
  description: "Fetch the full markdown content and metadata of a single blog post by its id.",
  inputSchema: { id: z.string().trim().min(1).describe("The blog post id (slug).") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("blog_posts")
      .select("id, title, excerpt, content, category, read_time, date, cover_image")
      .eq("id", id)
      .maybeSingle();

    if (error) return toolError("get-blog-post", error);
    if (!data) return { content: [{ type: "text", text: `No blog post found with id "${id}".` }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { post: data },
    };
  },
});
