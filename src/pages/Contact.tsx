import { useState } from "react";
import { Send, Github, Linkedin, MessageSquare, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import ScrollReveal from "@/components/ScrollReveal";
import { useSendContactMessage } from "@/hooks/useContactMessages";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const sendMessage = useSendContactMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      await sendMessage.mutateAsync(form);
      setForm({ name: "", email: "", message: "" });
      toast.success("Message sent! I'll get back to you soon.");
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <main className="pt-16">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="container max-w-3xl py-16 relative">
          <ScrollReveal>
            <p className="text-sm font-medium text-primary mb-2">Contact</p>
            <h1 className="text-4xl font-bold mb-3">Let's Connect</h1>
            <p className="text-muted-foreground">
              Got a question, idea, or collaboration opportunity? I'd love to hear from you.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="container max-w-3xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Form */}
          <div className="md:col-span-3">
            <ScrollReveal delay={80}>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                      maxLength={255}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="What's on your mind?"
                    rows={6}
                    maxLength={1000}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sendMessage.isPending}
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendMessage.isPending ? "Sending..." : "Send Message"}
                  <Send className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>
            </ScrollReveal>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-2">
            <ScrollReveal delay={160}>
              <div className="space-y-6">
                <div className="rounded-2xl border border-border/50 bg-card p-6">
                  <h3 className="font-semibold mb-4">Quick Info</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span>Arba Minch, Ethiopia</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-primary shrink-0" />
                      <span>Available for freelance</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/50 bg-card p-6">
                  <h3 className="font-semibold mb-4">Find me elsewhere</h3>
                  <div className="space-y-2">
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
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-secondary/30 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all active:scale-95"
                      >
                        <Icon className="h-4 w-4" /> {label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;
