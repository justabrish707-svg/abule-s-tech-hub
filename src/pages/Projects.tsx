import ProjectCard from "@/components/ProjectCard";
import ScrollReveal from "@/components/ScrollReveal";
import { projects } from "@/data/projects";

const Projects = () => (
  <main className="pt-16">
    <div className="container py-16">
      <ScrollReveal>
        <h1 className="text-3xl font-bold mb-2">Projects</h1>
        <p className="text-muted-foreground mb-8">
          Things I've built and experiments I'm working on.
        </p>
      </ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project, i) => (
          <ScrollReveal key={project.id} delay={i * 80}>
            <ProjectCard project={project} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  </main>
);

export default Projects;
