import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import SEO from "@/components/SEO";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { useAuth } from "@/contexts/AuthContext";
import { requestCodeReview } from "@/services/code-review";

const MAX_CHARS = 12000;

const CodeReview = () => {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const review = useMutation({ mutationFn: requestCodeReview });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 10) return;
    review.mutate({ code, language: language || undefined });
  };

  return (
    <main className="min-h-screen pt-28 pb-16 px-4">
      <SEO
        title="AI code security review — Abule Tech"
        description="Paste a code snippet and get an AI-powered review of potential security weaknesses with safer fixes."
        path="/tools/code-review"
      />
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="h-7 w-7 text-primary" aria-hidden="true" />
          <h1 className="text-3xl font-bold">AI code security review</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Paste a snippet and get an AI-powered report on potential vulnerabilities with suggested fixes. Don't paste real secrets.
        </p>

        {!user ? (
          <div className="glass rounded-xl border border-border/40 p-6 text-center">
            <p className="mb-4">Sign in to use the code reviewer.</p>
            <Button asChild><Link to="/auth">Sign in</Link></Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="cr-language" className="text-sm font-medium">Language (optional)</label>
              <Input id="cr-language" value={language} maxLength={40} placeholder="e.g. TypeScript, Python, PHP"
                onChange={(e) => setLanguage(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label htmlFor="cr-code" className="text-sm font-medium">Code snippet</label>
              <Textarea id="cr-code" value={code} maxLength={MAX_CHARS} rows={14} spellCheck={false}
                placeholder={"app.get('/user', (req, res) => {\n  db.query(`SELECT * FROM users WHERE id = ${req.query.id}`);\n});"}
                onChange={(e) => setCode(e.target.value)} className="mt-1 font-mono text-sm" />
              <p className="text-xs text-muted-foreground mt-1 text-right">{code.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}</p>
            </div>
            <Button type="submit" disabled={review.isPending || code.trim().length < 10}>
              {review.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {review.isPending ? "Reviewing…" : "Review my code"}
            </Button>
          </form>
        )}

        <section aria-live="polite" className="mt-10">
          {review.isPending && (
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}
          {review.isError && (
            <div role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm">
              {review.error.message}
            </div>
          )}
          {review.data && !review.isPending && (
            <article className="glass rounded-xl border border-border/40 p-6">
              <MarkdownRenderer content={review.data} />
              <p className="text-xs text-muted-foreground mt-6">AI suggestions can be wrong — verify before shipping.</p>
            </article>
          )}
        </section>
      </div>
    </main>
  );
};

export default CodeReview;
