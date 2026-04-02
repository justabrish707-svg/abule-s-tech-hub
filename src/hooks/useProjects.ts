import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  github: string | null;
  demo: string | null;
  status: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useSaveProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (project: Partial<Project> & { title: string; description: string }) => {
      if (project.id) {
        const { error } = await supabase.from("projects").update({
          title: project.title,
          description: project.description,
          tech: project.tech || [],
          github: project.github || null,
          demo: project.demo || null,
          status: project.status || "planned",
          display_order: project.display_order || 0,
          updated_at: new Date().toISOString(),
        }).eq("id", project.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("projects").insert({
          title: project.title,
          description: project.description,
          tech: project.tech || [],
          github: project.github || null,
          demo: project.demo || null,
          status: project.status || "planned",
          display_order: project.display_order || 0,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
};
