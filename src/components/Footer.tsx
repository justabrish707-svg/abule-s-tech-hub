import { Terminal, Github, Linkedin, Send } from "lucide-react";
import { Link } from "react-router-dom";
import NewsletterSignup from "@/components/NewsletterSignup";

const Footer = () => (
  <footer className="border-t border-border/50 bg-card/50">
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-3">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="font-bold">abule<span className="text-primary">.tech</span></span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">
            Code. Create. Learn. Repeat. Sharing my journey through computer science and technology.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Pages</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {["/blog", "/projects", "/about", "/contact"].map((path) => (
              <li key={path}>
                <Link to={path} className="hover:text-primary transition-colors">
                  {path.slice(1).charAt(0).toUpperCase() + path.slice(2)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Connect</h4>
          <div className="flex gap-3">
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
                className="p-2 rounded-md bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors active:scale-95"
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <NewsletterSignup />
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Abule Tech. Built with passion and caffeine.
      </div>
    </div>
  </footer>
);

export default Footer;
