import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import ProjectCard from "@/components/ProjectCard";
import ScrollReveal from "@/components/ScrollReveal";

const statusFilters = ["All", "completed", "in-progress", "planned"];

const Projects = () => {
  const { data: projects = [], isLoading } = useProjects();
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? projects : projects.filter((p) => p.status === filter);

  return (
    <main className="pt-16">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="container py-16 relative">
          <ScrollReveal>
            <p className="text-sm font-medium text-primary mb-2">Portfolio</p>
            <h1 className="text-4xl font-bold mb-3">Projects</h1>
            <p className="text-muted-foreground max-w-lg">
              Things I've built, experiments I'm running, and ideas I'm exploring.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="container py-10">
        <ScrollReveal delay={80}>
          <div className="flex gap-1.5 flex-wrap mb-8">
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 capitalize ${
                  filter === s
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                {s === "All" ? "All" : s.replace("-", " ")}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-52 rounded-2xl bg-card border border-border/50 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-16">No projects found. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((project, i) => (
              <ScrollReveal key={project.id} delay={i * 80}>
                <ProjectCard project={project} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Projects;
