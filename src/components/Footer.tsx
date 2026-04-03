import { Terminal, Github, Linkedin, Send } from "lucide-react";
import { Link } from "react-router-dom";
import NewsletterSignup from "./NewsletterSignup";

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
            {[
              { icon: Github, href: "https://github.com", label: "GitHub" },
              { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
              { icon: Send, href: "https://t.me", label: "Telegram" },
            ].map(({ icon: Icon, href, label }) => (
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
                <Link to={path} className="hover:text-primary transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
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
