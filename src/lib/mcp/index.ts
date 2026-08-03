import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listBlogPosts from "./tools/list-blog-posts";
import getBlogPost from "./tools/get-blog-post";
import createBlogPost from "./tools/create-blog-post";
import listProjects from "./tools/list-projects";
import postComment from "./tools/post-comment";

// The OAuth issuer must be the direct Supabase host, built from the project ref
// (inlined at build time) so the module stays import-safe.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "abule-s-tech-hub",
  title: "Abule's Tech Hub",
  version: "0.1.0",
  instructions:
    "Tools for Abule's Tech Hub, a developer blog and portfolio. Read and search blog posts, read full markdown content, list portfolio projects, publish new posts (admins only), and comment on posts as the signed-in user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listBlogPosts, getBlogPost, createBlogPost, listProjects, postComment],
});
