import { ExternalLink, Github, Clock, CheckCircle2, Lightbulb } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  github?: string | null;
  demo?: string | null;
  status: string;
}

const statusConfig: Record<string, { icon: typeof CheckCircle2; label: string; className: string }> = {
  completed: { icon: CheckCircle2, label: "Completed", className: "text-primary" },
  "in-progress": { icon: Clock, label: "In Progress", className: "text-amber-400" },
  planned: { icon: Lightbulb, label: "Planned", className: "text-muted-foreground" },
};

const ProjectCard = ({ project }: { project: Project }) => {
  const status = statusConfig[project.status] || statusConfig.planned;
  const StatusIcon = status.icon;

  return (
    <div className="rounded-lg border border-border/50 bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_24px_hsl(var(--primary)/0.08)]">
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center gap-1.5 text-xs font-medium ${status.className}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {status.label}
        </div>
        <div className="flex gap-2">
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors active:scale-95" aria-label="GitHub">
              <Github className="h-4 w-4" />
            </a>
          )}
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors active:scale-95" aria-label="Live demo">
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
      <h3 className="text-base font-semibold mb-2">{project.title}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{project.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {(project.tech || []).map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProjectCard;
