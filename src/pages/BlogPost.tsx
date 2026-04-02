import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useBlogPost } from "@/hooks/useBlogPosts";
import CommentSection from "@/components/CommentSection";

const renderContent = (content: string) => {
  const lines = content.split("\n");
  const elements: JSX.Element[] = [];
  let codeBlock: string[] = [];
  let inCode = false;
  let codeLang = "";

  lines.forEach((line, i) => {
    if (line.startsWith("```") && !inCode) {
      inCode = true;
      codeLang = line.slice(3).trim();
      codeBlock = [];
      return;
    }
    if (line.startsWith("```") && inCode) {
      inCode = false;
      elements.push(
        <div key={`code-${i}`} className="my-4 rounded-lg overflow-hidden border border-border/50">
          {codeLang && (
            <div className="px-4 py-1.5 bg-secondary text-xs font-mono text-muted-foreground border-b border-border/50">
              {codeLang}
            </div>
          )}
          <pre className="p-4 bg-card overflow-x-auto">
            <code className="text-sm font-mono text-foreground/90">{codeBlock.join("\n")}</code>
          </pre>
        </div>
      );
      return;
    }
    if (inCode) {
      codeBlock.push(line);
      return;
    }
    if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-xl font-bold mt-8 mb-3">{line.slice(3)}</h2>);
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(<p key={i} className="font-semibold mt-4 mb-1">{line.slice(2, -2)}</p>);
    } else if (line.startsWith("- ")) {
      elements.push(
        <li key={i} className="ml-4 text-muted-foreground list-disc">{renderInline(line.slice(2))}</li>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="text-muted-foreground leading-relaxed">{renderInline(line)}</p>
      );
    }
  });

  return elements;
};

const renderInline = (text: string) => {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="px-1.5 py-0.5 rounded bg-secondary font-mono text-xs text-primary">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const BlogPost = () => {
  const { id } = useParams();
  const { data: post, isLoading } = useBlogPost(id);

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
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-10">
            <span>by Abule</span>
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{post.read_time}</span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={160}>
          <div className="prose-custom">{renderContent(post.content)}</div>
        </ScrollReveal>

        <CommentSection postId={post.id} />
      </article>
    </main>
  );
};

export default BlogPost;
