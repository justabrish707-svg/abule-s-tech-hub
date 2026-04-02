import { useProjects } from "@/hooks/useProjects";
import ProjectCard from "@/components/ProjectCard";
import ScrollReveal from "@/components/ScrollReveal";

const Projects = () => {
  const { data: projects = [], isLoading } = useProjects();

  return (
    <main className="pt-16">
      <div className="container py-16">
        <ScrollReveal>
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground mb-8">
            Things I've built and experiments I'm working on.
          </p>
        </ScrollReveal>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-lg bg-secondary/30 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No projects yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, i) => (
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
