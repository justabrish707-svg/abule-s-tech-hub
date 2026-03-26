import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import type { BlogPost } from "@/hooks/useBlogPosts";

const BlogCard = ({ post }: { post: BlogPost }) => (
  <Link
    to={`/blog/${post.id}`}
    className="group block rounded-lg border border-border/50 bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_24px_hsl(var(--primary)/0.08)] active:scale-[0.98]"
  >
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
        {post.category}
      </span>
      <span className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {post.read_time}
      </span>
      <span>·</span>
      <span>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
    </div>
    <h3 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
      {post.title}
    </h3>
    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      Read more <ArrowRight className="h-3 w-3" />
    </span>
  </Link>
);

export default BlogCard;
