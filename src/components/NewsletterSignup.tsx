import { useState } from "react";
import { Mail, ArrowRight, Check } from "lucide-react";
import { useSubscribe } from "@/hooks/useNewsletter";
import { toast } from "sonner";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const subscribe = useSubscribe();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await subscribe.mutateAsync(email);
      setSubscribed(true);
      setEmail("");
      toast.success("You're subscribed! 🎉");
    } catch (err: any) {
      toast.error(err.message || "Failed to subscribe");
    }
  };

  if (subscribed) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-3">
          <Check className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm font-semibold">You're on the list!</p>
        <p className="text-xs text-muted-foreground mt-1">Thanks for subscribing.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card p-6">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Newsletter</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Get new posts delivered to your inbox. No spam, unsubscribe anytime.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          maxLength={255}
          className="flex-1 px-3 py-2 rounded-lg border border-border/50 bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        <button
          type="submit"
          disabled={subscribe.isPending}
          className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 disabled:opacity-50 transition-all"
        >
          {subscribe.isPending ? "..." : <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
};

export default NewsletterSignup;
