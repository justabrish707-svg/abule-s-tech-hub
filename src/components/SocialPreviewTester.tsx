import { useMemo, useState } from "react";
import { ImageIcon, RefreshCw, ExternalLink, Copy, Check } from "lucide-react";

interface SocialPreviewTesterProps {
  title: string;
  excerpt: string;
  category: string;
  coverImage: string | null;
  postId: string;
}

const SITE = "https://abule-tech.lovable.app";

export const SocialPreviewTester = ({ title, excerpt, category, coverImage, postId }: SocialPreviewTesterProps) => {
  const [bust, setBust] = useState(0);
  const [copied, setCopied] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const dynamicOg = useMemo(() => {
    const params = new URLSearchParams({
      title: title || "Untitled",
      category: category || "Programming",
      author: "Abraham Admasu",
    });
    return `${supabaseUrl}/functions/v1/og-image?${params.toString()}&v=${bust}`;
  }, [title, category, supabaseUrl, bust]);

  const imageUrl = coverImage ?? dynamicOg;
  const isDynamic = !coverImage;
  const canonical = postId ? `${SITE}/blog/${postId}` : `${SITE}/blog`;

  const metaTags = [
    `<title>${title || "Untitled"} | Abule Tech</title>`,
    `<meta name="description" content="${excerpt || ""}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:title" content="${title || "Untitled"} | Abule Tech" />`,
    `<meta property="og:description" content="${excerpt || ""}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:image" content="${imageUrl}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    isDynamic ? `<meta property="og:image:type" content="image/svg+xml" />` : null,
    `<meta property="og:image:alt" content="${title || "Untitled"}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:image" content="${imageUrl}" />`,
  ].filter(Boolean).join("\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(metaTags);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl border border-border/50 bg-secondary/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ImageIcon className="h-3.5 w-3.5" /> Social preview
          <span className="text-xs text-muted-foreground/60 font-normal">
            {isDynamic ? "Generated OG (1200×630)" : "Custom cover"}
          </span>
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBust((b) => b + 1)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" /> Open
          </a>
        </div>
      </div>

      {/* 1.91:1 OG ratio frame */}
      <div className="rounded-lg overflow-hidden border border-border/50 bg-background aspect-[1200/630]">
        <img
          src={imageUrl}
          alt={`OG preview: ${title || "Untitled"}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Twitter/LinkedIn-style card mock */}
      <div className="rounded-lg overflow-hidden border border-border/50 bg-card">
        <div className="aspect-[1200/630] bg-secondary/30">
          <img src={imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="p-3 space-y-1">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">abule-tech.lovable.app</p>
          <p className="font-semibold text-sm leading-tight line-clamp-2">{title || "Untitled"} | Abule Tech</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{excerpt || "Add an excerpt to preview the description."}</p>
        </div>
      </div>

      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground select-none flex items-center gap-2">
          <span>Generated meta tags</span>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); handleCopy(); }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-primary hover:bg-primary/10"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {copied ? "Copied" : "Copy"}
          </button>
        </summary>
        <pre className="mt-2 p-3 rounded-lg bg-background border border-border/50 overflow-x-auto text-[11px] font-mono leading-relaxed text-foreground/80 whitespace-pre">{metaTags}</pre>
      </details>
    </div>
  );
};

export default SocialPreviewTester;
