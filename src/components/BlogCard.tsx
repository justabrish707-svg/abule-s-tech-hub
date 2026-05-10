import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import type { BlogPost } from "@/hooks/useBlogPosts";
import { supabaseImage } from "@/lib/image";

const BlogCard = ({ post }: { post: BlogPost }) => (
  <Link
    to={`/blog/${post.id}`}
    className="group block rounded-2xl border border-border/50 bg-card card-hover active:scale-[0.98] overflow-hidden relative"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    {post.cover_image && (
      <div className="relative h-44 overflow-hidden">
        <img
          src={post.cover_image}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
      </div>
    )}
    <div className="relative p-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
        <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
          {post.category}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {post.read_time}
        </span>
      </div>
      <h3 className="text-lg font-bold mb-2.5 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
        {post.title}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{post.excerpt}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-4px] group-hover:translate-x-0">
          Read more <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  </Link>
);

export default BlogCard;
