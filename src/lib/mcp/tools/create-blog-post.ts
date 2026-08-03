import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { toolError } from "../errors";

export default defineTool({
  name: "create_blog_post",
  title: "Create blog post",
  description:
    "Publish a new blog post written in GitHub-flavored markdown. Requires an admin account; non-admins are rejected by database policy.",
  inputSchema: {
    id: z.string().trim().min(1).describe("URL slug, e.g. 'react-security-best-practices'."),
    title: z.string().trim().min(1),
    excerpt: z.string().trim().min(1).describe("Short summary shown in listings and social previews."),
    content: z.string().trim().min(1).describe("Full post body in GitHub-flavored markdown."),
    category: z.string().trim().min(1),
    read_time: z.string().trim().min(1).describe("Human-readable reading time, e.g. '6 min read'."),
    cover_image: z.string().trim().url().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("blog_posts")
      .insert({ ...input, author_id: ctx.getUserId() })
      .select("id, title, category, date")
      .single();

    if (error) return toolError("create-blog-post", error);
    return {
      content: [{ type: "text", text: `Published "${data.title}" at /blog/${data.id}` }],
      structuredContent: { post: data },
    };
  },
});
