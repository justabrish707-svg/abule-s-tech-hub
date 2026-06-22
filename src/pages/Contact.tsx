import { useState } from "react";
import { Send, MessageSquare, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import ScrollReveal from "@/components/ScrollReveal";
import SEO from "@/components/SEO";
import { useSendContactMessage } from "@/hooks/useContactMessages";
import contactBg from "@/assets/contact-bg.jpg";

const socials = [
  { icon: Send, href: "https://t.me/abule_48", label: "Telegram", handle: "@abule_48" },
  { icon: Phone, href: "https://wa.me/2510954897133", label: "WhatsApp", handle: "0954897133" },
  { icon: Mail, href: "mailto:abuleman1221@gmail.com", label: "Email", handle: "abuleman1221@gmail.com" },
  {
    icon: () => (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
    ),
    href: "https://instagram.com/abule_48",
    label: "Instagram",
    handle: "@abule_48",
  },
  {
    icon: () => (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.14a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.57z"/></svg>
    ),
    href: "https://tiktok.com/@abulala88",
    label: "TikTok",
    handle: "@abulala88",
  },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [hp, setHp] = useState("");
  const sendMessage = useSendContactMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp) return; // bot — silently drop
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
      <SEO
        title="Contact — Get in Touch with Abraham Admasu | Abule Tech"
        description="Reach out to Abraham Admasu for collaboration, questions, or feedback. Connect via email, Telegram, WhatsApp, Instagram, or TikTok."
        path="/contact"
      />
      {/* Header */}
      <section className="relative overflow-hidden border-b border-border/30">
        <img src={contactBg} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-30" loading="lazy" width={1920} height={768} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
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
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all" maxLength={100} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all" maxLength={255} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="What's on your mind?" rows={6} maxLength={1000} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all resize-none" />
                </div>
                <button type="submit" disabled={sendMessage.isPending} className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed">
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
                    <a href="mailto:abuleman1221@gmail.com" className="flex items-center gap-3 hover:text-primary transition-colors">
                      <Mail className="h-4 w-4 text-primary shrink-0" />
                      <span>abuleman1221@gmail.com</span>
                    </a>
                    <a href="tel:0954897133" className="flex items-center gap-3 hover:text-primary transition-colors">
                      <Phone className="h-4 w-4 text-primary shrink-0" />
                      <span>0954897133</span>
                    </a>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/50 bg-card p-6">
                  <h3 className="font-semibold mb-4">Find me elsewhere</h3>
                  <div className="space-y-2">
                    {socials.map(({ icon: Icon, href, label, handle }) => (
                      <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-4 py-3 rounded-xl border border-border/50 bg-secondary/30 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all active:scale-95">
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4" /> {label}
                        </span>
                        <span className="text-xs text-muted-foreground/70">{handle}</span>
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
