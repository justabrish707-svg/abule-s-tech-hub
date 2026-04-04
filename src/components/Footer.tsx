import { Terminal, Send, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import NewsletterSignup from "./NewsletterSignup";

const socials = [
  { icon: Send, href: "https://t.me/abule_48", label: "Telegram" },
  { icon: Phone, href: "https://wa.me/2510954897133", label: "WhatsApp" },
  { icon: Mail, href: "mailto:abuleman1221@gmail.com", label: "Email" },
];

const Footer = () => (
  <footer className="border-t border-border/30 bg-card/30">
    <div className="container py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Terminal className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold">abule<span className="text-gradient">.tech</span></span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
            Code. Create. Learn. Repeat. Sharing my journey through computer science, web development, and cybersecurity.
          </p>
          <div className="flex gap-2">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
            <a href="https://instagram.com/abule_48" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all active:scale-95" aria-label="Instagram">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="https://tiktok.com/@abulala88" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all active:scale-95" aria-label="TikTok">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.14a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.57z"/></svg>
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-4">Pages</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {[
              { path: "/blog", label: "Blog" },
              { path: "/projects", label: "Projects" },
              { path: "/about", label: "About" },
              { path: "/contact", label: "Contact" },
            ].map(({ path, label }) => (
              <li key={path}>
                <Link to={path} className="hover:text-primary transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            <a href="mailto:abuleman1221@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="h-3.5 w-3.5" /> abuleman1221@gmail.com
            </a>
            <a href="tel:0954897133" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="h-3.5 w-3.5" /> 0954897133
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-4">Stay Updated</h4>
          <NewsletterSignup compact />
        </div>
      </div>
      <div className="mt-12 pt-6 border-t border-border/30 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Abule Tech. Built with passion and caffeine.
      </div>
    </div>
  </footer>
);

export default Footer;
