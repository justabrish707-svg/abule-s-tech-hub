import { Link } from "react-router-dom";
import { ArrowRight, Shield, Globe, Code2, Zap, BookOpen, Rocket, Send, Phone, Mail } from "lucide-react";
import TypingEffect from "@/components/TypingEffect";
import BlogCard from "@/components/BlogCard";
import ProjectCard from "@/components/ProjectCard";
import ScrollReveal from "@/components/ScrollReveal";
import NewsletterSignup from "@/components/NewsletterSignup";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useProjects } from "@/hooks/useProjects";
import heroBg from "@/assets/hero-bg.jpg";

const skills = [
  { icon: Globe, label: "Web Development", desc: "HTML, CSS, JavaScript, React", gradient: "from-blue-500/20 to-cyan-500/20" },
  { icon: Shield, label: "Cybersecurity", desc: "Network security, ethical hacking", gradient: "from-red-500/20 to-orange-500/20" },
  { icon: Code2, label: "Programming", desc: "C++, Python, TypeScript", gradient: "from-primary/20 to-emerald-400/20" },
];

const stats = [
  { value: "10+", label: "Projects Built", icon: Rocket },
  { value: "50+", label: "Articles Written", icon: BookOpen },
  { value: "∞", label: "Lines of Code", icon: Zap },
];

const socials = [
  { icon: Send, href: "https://t.me/abule_48", label: "Telegram" },
  { icon: Phone, href: "https://wa.me/2510954897133", label: "WhatsApp" },
  { icon: Mail, href: "mailto:abuleman1221@gmail.com", label: "Email" },
];

const Index = () => {
  const { data: blogPosts = [] } = useBlogPosts();
  const { data: projects = [] } = useProjects();

  return (
    <main className="pt-16">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <img src={heroBg} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-40" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 hero-gradient" />

        <div className="container py-20 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-medium text-primary mb-6 opacity-0 animate-fade-up" style={{ animationDelay: "100ms" }}>
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Open to opportunities
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-5 opacity-0 animate-fade-up" style={{ animationDelay: "200ms" }}>
              Hi, I'm <span className="text-gradient">Abule</span>
              <br />
              <span className="text-muted-foreground text-3xl sm:text-4xl md:text-5xl font-bold">I build things for the web</span>
            </h1>

            <div className="text-lg sm:text-xl h-8 mb-6 opacity-0 animate-fade-up" style={{ animationDelay: "350ms" }}>
              <TypingEffect />
            </div>

            <p className="text-muted-foreground max-w-xl mb-8 text-base leading-relaxed opacity-0 animate-fade-up" style={{ animationDelay: "500ms" }}>
              Computer science student sharing my journey in tech, coding, and cybersecurity.
              I believe in learning by building and teaching what I learn.
            </p>

            <div className="flex flex-wrap gap-3 opacity-0 animate-fade-up" style={{ animationDelay: "650ms" }}>
              <Link to="/blog" className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-200 active:scale-[0.97]">
                Read Blog <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/projects" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card/50 text-foreground font-semibold text-sm hover:border-primary/30 hover:bg-card transition-all duration-200 active:scale-[0.97]">
                View Projects
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-muted-foreground font-medium text-sm hover:text-foreground transition-colors">
                Get in Touch
              </Link>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2 mt-6 opacity-0 animate-fade-up" style={{ animationDelay: "750ms" }}>
              {socials.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all active:scale-95" aria-label={label}>
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-8 mt-10 pt-8 border-t border-border/30 opacity-0 animate-fade-up" style={{ animationDelay: "800ms" }}>
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-24 border-t border-border/30 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
        <div className="container relative">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-sm font-medium text-primary mb-2">Latest Articles</p>
                <h2 className="text-3xl font-bold">Recent Posts</h2>
              </div>
              <Link to="/blog" className="group text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {blogPosts.slice(0, 3).map((post, i) => (
              <ScrollReveal key={post.id} delay={i * 100}>
                <BlogCard post={post} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-24 border-t border-border/30">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-sm font-medium text-primary mb-2">Expertise</p>
              <h2 className="text-3xl font-bold mb-3">What I Work With</h2>
              <p className="text-muted-foreground max-w-md mx-auto">Technologies and domains I'm passionate about and constantly learning.</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {skills.map((skill, i) => (
              <ScrollReveal key={skill.label} delay={i * 100}>
                <div className={`group relative rounded-2xl border border-border/50 bg-card p-7 card-hover overflow-hidden`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${skill.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <skill.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{skill.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{skill.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 border-t border-border/30 relative">
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="container max-w-lg relative">
          <ScrollReveal>
            <NewsletterSignup />
          </ScrollReveal>
        </div>
      </section>

      {/* Projects Preview */}
      <section className="py-24 border-t border-border/30">
        <div className="container">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-sm font-medium text-primary mb-2">Portfolio</p>
                <h2 className="text-3xl font-bold">Projects</h2>
              </div>
              <Link to="/projects" className="group text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                See all <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.slice(0, 3).map((project, i) => (
              <ScrollReveal key={project.id} delay={i * 100}>
                <ProjectCard project={project} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
