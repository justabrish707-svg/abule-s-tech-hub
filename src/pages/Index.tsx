import { Link } from "react-router-dom";
import { ArrowRight, Shield, Globe, Code2, Zap, BookOpen, Rocket, Send, Phone, Mail, Quote, Star, FolderGit2, MessageCircle } from "lucide-react";
import TypingEffect from "@/components/TypingEffect";
import BlogCard from "@/components/BlogCard";
import ProjectCard from "@/components/ProjectCard";
import ScrollReveal from "@/components/ScrollReveal";
import NewsletterSignup from "@/components/NewsletterSignup";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useProjects } from "@/hooks/useProjects";
import heroBg from "@/assets/hero-bg.jpg";
import abulePortrait from "@/assets/abule-portrait.png";

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

const testimonials = [
  {
    quote: "Abule turned a messy idea into a clean, production-ready product. Sharp instincts and a real eye for detail.",
    name: "Daniel T.",
    role: "Indie Founder",
  },
  {
    quote: "His blog posts on web security are the kind I actually save. Practical, well-explained, and to the point.",
    name: "Sara M.",
    role: "Frontend Engineer",
  },
  {
    quote: "Reliable, curious, and a quick learner. Easily one of the strongest junior devs I've worked alongside.",
    name: "Yonas K.",
    role: "CS Student & Collaborator",
  },
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
        <div className="absolute inset-0 grid-pattern opacity-[0.07]" />
        {/* Floating ambient orbs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-[float_8s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute bottom-0 right-10 h-96 w-96 rounded-full bg-primary-glow/10 blur-3xl animate-[float_11s_ease-in-out_infinite]" />

        <div className="container py-20 relative">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
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
                <Link to="/blog" className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/50 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-200 active:scale-[0.97]">
                  <BookOpen className="h-4 w-4" /> Read Blog <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link to="/projects" className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card/50 text-foreground font-semibold text-sm hover:border-primary/40 hover:bg-card hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.97]">
                  <FolderGit2 className="h-4 w-4 text-primary" /> View Projects
                </Link>
                <Link to="/contact" className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-muted-foreground font-medium text-sm hover:text-primary transition-colors">
                  <MessageCircle className="h-4 w-4" /> Get in Touch
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
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
              <div className="flex flex-wrap items-center gap-8 mt-10 pt-8 border-t border-border/30 opacity-0 animate-fade-up" style={{ animationDelay: "800ms" }}>
                {stats.map((stat) => (
                  <div key={stat.label} className="group flex items-center gap-3 cursor-default">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110 group-hover:rotate-3">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gradient">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Portrait */}
            <div className="hidden lg:block relative opacity-0 animate-fade-up" style={{ animationDelay: "400ms" }}>
              <div className="relative aspect-[4/5] max-w-md mx-auto group">
                <div className="absolute -inset-6 rounded-[2.25rem] bg-gradient-to-br from-primary/40 via-primary/10 to-transparent blur-3xl animate-[pulse-glow_4s_ease-in-out_infinite]" />
                <div className="absolute -inset-1 rounded-[1.75rem] bg-gradient-to-br from-primary/50 via-primary-glow/30 to-transparent" />
                <div className="relative h-full w-full rounded-[1.5rem] overflow-hidden border border-primary/20 glow-border transition-transform duration-700 group-hover:scale-[1.02]">
                  <img src={abulePortrait} alt="Abule — founder of Abule Tech" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                  {/* Subtle scanline shimmer */}
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_40%,hsl(var(--primary)/0.12)_50%,transparent_60%)] bg-[length:250%_100%] animate-[shimmer_4s_linear_infinite]" />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 bg-card/90 backdrop-blur-xl border border-border/60 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 animate-[float_5s_ease-in-out_infinite]">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                  <div>
                    <p className="text-xs font-semibold">Available for work</p>
                    <p className="text-[10px] text-muted-foreground">Let's build together</p>
                  </div>
                </div>
                {/* Floating tech chip */}
                <div className="absolute -top-3 -right-3 bg-card/90 backdrop-blur-xl border border-border/60 rounded-xl px-3 py-2 shadow-xl flex items-center gap-2 animate-[float_6s_ease-in-out_infinite]">
                  <Code2 className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-mono font-semibold">{`</dev>`}</span>
                </div>
              </div>
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
