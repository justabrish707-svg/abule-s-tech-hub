export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  github?: string;
  demo?: string;
  status: "completed" | "in-progress" | "planned";
}

export const projects: Project[] = [
  {
    id: "calculator-app",
    title: "Calculator App",
    description: "A fully functional calculator built with clean UI and keyboard support. Handles basic arithmetic and percentage calculations with error handling.",
    tech: ["HTML", "CSS", "JavaScript"],
    github: "https://github.com",
    demo: "https://example.com",
    status: "completed",
  },
  {
    id: "hotel-website",
    title: "Hotel Website",
    description: "A responsive hotel booking website with room listings, image galleries, and a reservation form. Designed with a focus on user experience and clean aesthetics.",
    tech: ["HTML", "CSS", "JavaScript", "Bootstrap"],
    github: "https://github.com",
    status: "completed",
  },
  {
    id: "portfolio-site",
    title: "Abule Tech Blog",
    description: "This very website — a personal tech blog built to share knowledge, showcase projects, and document my learning journey in computer science.",
    tech: ["React", "TypeScript", "Tailwind CSS"],
    github: "https://github.com",
    demo: "https://example.com",
    status: "completed",
  },
  {
    id: "network-scanner",
    title: "Network Scanner Tool",
    description: "A command-line network scanning utility for discovering active hosts and open ports on a local network. Built as a cybersecurity learning project.",
    tech: ["Python", "Scapy"],
    status: "in-progress",
  },
  {
    id: "task-manager",
    title: "Task Manager CLI",
    description: "A terminal-based task management app with priorities, deadlines, and persistent storage. Designed to practice C++ file handling and data structures.",
    tech: ["C++"],
    status: "planned",
  },
];
