import { Link } from "react-router-dom";
import { ArrowRight, Shield, Globe, Code2 } from "lucide-react";
import TypingEffect from "@/components/TypingEffect";
import BlogCard from "@/components/BlogCard";
import ProjectCard from "@/components/ProjectCard";
import ScrollReveal from "@/components/ScrollReveal";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { projects } from "@/data/projects";

const skills = [
  { icon: Globe, label: "Web Development", desc: "HTML, CSS, JavaScript, React" },
  { icon: Shield, label: "Cybersecurity", desc: "Network security, ethical hacking" },
  { icon: Code2, label: "Programming", desc: "C++, Python, TypeScript" },
];

const Index = () => (
  <main className="pt-16">
    {/* Hero */}
    <section className="min-h-[85vh] flex items-center">
      <div className="container py-20">
        <div className="max-w-2xl">
          <p
            className="text-sm font-mono text-muted-foreground mb-4 opacity-0 animate-fade-up"
            style={{ animationDelay: "100ms" }}
          >
            {"// welcome to"}
          </p>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05] mb-4 opacity-0 animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            Abule <span className="text-gradient">Tech</span>
          </h1>
          <div
            className="text-lg sm:text-xl h-8 mb-6 opacity-0 animate-fade-up"
            style={{ animationDelay: "350ms" }}
          >
            <TypingEffect />
          </div>
          <p
            className="text-muted-foreground max-w-lg mb-8 opacity-0 animate-fade-up"
            style={{ animationDelay: "500ms", lineHeight: 1.7 }}
          >
            I'm Abule, a computer science student sharing my journey in tech,
            coding, and cybersecurity. Let's learn and build together.
          </p>
          <div
            className="flex flex-wrap gap-3 opacity-0 animate-fade-up"
            style={{ animationDelay: "650ms" }}
          >
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-medium text-sm transition-all duration-150 hover:brightness-110 active:scale-[0.97]"
            >
              Read Blog <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-border bg-secondary text-secondary-foreground font-medium text-sm transition-all duration-150 hover:bg-muted active:scale-[0.97]"
            >
              View Projects
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* Featured Posts */}
    <section className="py-20 border-t border-border/50">
      <div className="container">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Recent Posts</h2>
            <Link to="/blog" className="text-sm text-primary hover:underline underline-offset-4">
              View all →
            </Link>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blogPosts.slice(0, 3).map((post, i) => (
            <ScrollReveal key={post.id} delay={i * 80}>
              <BlogCard post={post} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    {/* Skills */}
    <section className="py-20 border-t border-border/50">
      <div className="container">
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-8">What I Work With</h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {skills.map((skill, i) => (
            <ScrollReveal key={skill.label} delay={i * 80}>
              <div className="rounded-lg border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/30">
                <skill.icon className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{skill.label}</h3>
                <p className="text-sm text-muted-foreground">{skill.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    {/* Projects Preview */}
    <section className="py-20 border-t border-border/50">
      <div className="container">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Projects</h2>
            <Link to="/projects" className="text-sm text-primary hover:underline underline-offset-4">
              See all →
            </Link>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.slice(0, 3).map((project, i) => (
            <ScrollReveal key={project.id} delay={i * 80}>
              <ProjectCard project={project} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  </main>
);

export default Index;
