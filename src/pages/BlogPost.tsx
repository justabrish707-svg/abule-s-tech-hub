import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useBlogPost } from "@/hooks/useBlogPosts";
import CommentSection from "@/components/CommentSection";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import BlogReaderToolbar, { useReaderPrefs } from "@/components/BlogReaderToolbar";

const BlogPost = () => {
  const { id } = useParams();
  const { data: post, isLoading } = useBlogPost(id);
  const [prefs, setPrefs, resetPrefs] = useReaderPrefs();

  if (isLoading) {
    return (
      <main className="pt-16">
        <div className="container max-w-2xl py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-24 bg-secondary rounded" />
            <div className="h-8 w-3/4 bg-secondary rounded" />
            <div className="h-4 w-1/2 bg-secondary rounded" />
            <div className="h-64 bg-secondary rounded mt-8" />
          </div>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="pt-16">
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Link to="/blog" className="text-primary hover:underline">← Back to Blog</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-16">
      <article className="container max-w-2xl py-16">
        <ScrollReveal>
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> All posts
          </Link>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <div className="mb-6">
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {post.category}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-4" style={{ textWrap: "balance" }}>
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <span>by Abule</span>
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{post.read_time}</span>
          </div>
          {post.cover_image && (
            <div className="rounded-2xl overflow-hidden border border-border/50 mb-10">
              <img src={post.cover_image} alt={post.title} loading="eager" decoding="async" className="w-full h-64 sm:h-80 object-cover" />
            </div>
          )}
          {!post.cover_image && <div className="mb-10" />}
        </ScrollReveal>

        <BlogReaderToolbar prefs={prefs} onChange={setPrefs} onReset={resetPrefs} />

        <ScrollReveal delay={160}>
          <MarkdownRenderer
            content={post.content}
            className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:text-foreground prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-p:text-foreground/85 prose-strong:text-foreground prose-a:text-primary prose-li:text-foreground/85 prose-code:text-primary prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.85em] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:not-italic prose-hr:border-border/50"
            // styling overrides via inline style for reader prefs
          />
          <style>{`
            article .prose { font-size: ${prefs.fontSize}px; line-height: ${prefs.lineHeight}; }
            article .prose p, article .prose li { line-height: ${prefs.lineHeight}; }
          `}</style>
        </ScrollReveal>

        <CommentSection postId={post.id} />
      </article>
    </main>
  );
};

export default BlogPost;
