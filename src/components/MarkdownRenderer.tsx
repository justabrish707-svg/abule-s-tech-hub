import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const components: Components = {
  img: ({ node, ...props }) => (
    <img
      {...props}
      loading="lazy"
      decoding="async"
      className="rounded-lg border border-border/40 my-6 mx-auto h-auto max-w-full"
    />
  ),
  table: ({ node, ...props }) => (
    <div className="my-6 -mx-4 sm:mx-0 overflow-x-auto rounded-lg border border-border/50">
      <table {...props} className="w-full text-sm border-collapse min-w-[480px]" />
    </div>
  ),
  thead: ({ node, ...props }) => <thead {...props} className="bg-secondary/60" />,
  th: ({ node, ...props }) => (
    <th {...props} className="border-b border-border/60 px-4 py-2.5 text-left font-semibold text-foreground" />
  ),
  td: ({ node, ...props }) => (
    <td {...props} className="border-b border-border/30 px-4 py-2.5 align-top text-muted-foreground" />
  ),
  a: ({ node, ...props }) => (
    <a
      {...props}
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="text-primary underline-offset-4 hover:underline break-words"
    />
  ),
  pre: ({ node, ...props }) => (
    <pre {...props} className="bg-card border border-border/50 rounded-lg p-4 overflow-x-auto text-xs leading-relaxed my-5" />
  ),
};

const MarkdownRenderer = ({ content, className = "" }: MarkdownRendererProps) => (
  <div className={className}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  </div>
);

export default MarkdownRenderer;
