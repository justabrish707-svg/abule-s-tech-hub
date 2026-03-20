import { useState } from "react";
import { Send, Github, Linkedin, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import ScrollReveal from "@/components/ScrollReveal";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setForm({ name: "", email: "", message: "" });
      toast.success("Message sent! I'll get back to you soon.");
    }, 1200);
  };

  return (
    <main className="pt-16">
      <div className="container max-w-xl py-16">
        <ScrollReveal>
          <h1 className="text-3xl font-bold mb-2">Contact</h1>
          <p className="text-muted-foreground mb-8">
            Got a question, idea, or just want to say hello? Reach out.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <form onSubmit={handleSubmit} className="space-y-4 mb-12">
            {[
              { key: "name" as const, label: "Name", type: "text", placeholder: "Your name" },
              { key: "email" as const, label: "Email", type: "email", placeholder: "you@example.com" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium mb-1.5">{field.label}</label>
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2.5 rounded-md border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                  maxLength={field.key === "name" ? 100 : 255}
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium mb-1.5">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="What's on your mind?"
                rows={5}
                maxLength={1000}
                className="w-full px-4 py-2.5 rounded-md border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-medium text-sm transition-all duration-150 hover:brightness-110 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? "Sending..." : "Send Message"}
              <Send className="h-4 w-4" />
            </button>
          </form>
        </ScrollReveal>

        <ScrollReveal delay={160}>
          <h2 className="text-lg font-semibold mb-3">Find me elsewhere</h2>
          <div className="flex gap-3">
            {[
              { icon: Github, href: "https://github.com", label: "GitHub" },
              { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
              { icon: MessageSquare, href: "https://t.me", label: "Telegram" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all active:scale-95"
              >
                <Icon className="h-4 w-4" /> {label}
              </a>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
};

export default Contact;
