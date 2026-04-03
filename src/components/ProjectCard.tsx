import { ExternalLink, Github, CheckCircle2, Clock, Lightbulb } from "lucide-react";
import type { Project } from "@/hooks/useProjects";

const statusConfig: Record<string, { icon: typeof CheckCircle2; label: string; color: string }> = {
  completed: { icon: CheckCircle2, label: "Completed", color: "text-primary bg-primary/10" },
  "in-progress": { icon: Clock, label: "In Progress", color: "text-amber-400 bg-amber-400/10" },
  planned: { icon: Lightbulb, label: "Planned", color: "text-blue-400 bg-blue-400/10" },
};

const ProjectCard = ({ project }: { project: Project }) => {
  const status = statusConfig[project.status] || statusConfig.planned;
  const StatusIcon = status.icon;

  return (
    <div className="group rounded-2xl border border-border/50 bg-card p-6 card-hover overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </div>
        </div>
        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{project.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {(project.tech || []).map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-md bg-secondary text-[11px] font-medium text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-secondary/50 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all active:scale-95">
              <Github className="h-3.5 w-3.5" /> Code
            </a>
          )}
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary/10 text-xs font-medium text-primary hover:bg-primary/20 transition-all active:scale-95">
              <ExternalLink className="h-3.5 w-3.5" /> Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
