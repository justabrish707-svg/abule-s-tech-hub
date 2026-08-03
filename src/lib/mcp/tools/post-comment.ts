import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "post_comment",
  title: "Post a comment",
  description: "Add a comment (or a threaded reply) to a blog post as the signed-in user.",
  inputSchema: {
    post_id: z.string().trim().min(1).describe("The blog post id to comment on."),
    content: z.string().trim().min(1).max(1000),
    parent_id: z.string().trim().uuid().optional().describe("Comment id to reply to."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ post_id, content, parent_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("comments")
      .insert({ post_id, content, parent_id: parent_id ?? null, user_id: ctx.getUserId() })
      .select("id, post_id, created_at")
      .single();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Comment posted on ${data.post_id}.` }],
      structuredContent: { comment: data },
    };
  },
});
