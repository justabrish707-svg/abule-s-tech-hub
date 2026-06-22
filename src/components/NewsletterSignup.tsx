import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useSubscribe } from "@/hooks/useNewsletter";

const NewsletterSignup = ({ compact = false }: { compact?: boolean }) => {
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState(""); // honeypot — must stay empty
  const subscribe = useSubscribe();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp) return; // bot — silently drop
    if (!email.trim()) return;
    try {
      await subscribe.mutateAsync(email.trim());
      setEmail("");
      toast.success("You're subscribed! 🎉");
    } catch {
      toast.error("Could not subscribe. Try again.");
    }
  };

  const Honeypot = (
    <input
      type="text"
      tabIndex={-1}
      autoComplete="off"
      value={hp}
      onChange={(e) => setHp(e.target.value)}
      name="website"
      aria-hidden="true"
      style={{ position: "absolute", left: "-10000px", width: 1, height: 1, opacity: 0 }}
    />
  );

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        {Honeypot}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          aria-label="Email address for newsletter"
          className="flex-1 px-3 py-2 rounded-lg border border-border bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        <button
          type="submit"
          disabled={subscribe.isPending}
          aria-label="Subscribe to newsletter"
          className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    );
  }

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-5">
        <Mail className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-2xl font-bold mb-2">Stay in the Loop</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
        Get notified about new posts, tutorials, and project updates. No spam, ever.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Email address for newsletter"
          className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
        />
        <button
          type="submit"
          disabled={subscribe.isPending}
          className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
        >
          {subscribe.isPending ? "..." : "Subscribe"}
        </button>
      </form>
    </div>
  );
};

export default NewsletterSignup;
