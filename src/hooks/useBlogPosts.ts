import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  read_time: string;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useBlogPosts = () => {
  return useQuery({
    queryKey: ["blog-posts"],
    queryFn: async (): Promise<BlogPost[]> => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useBlogPost = (id: string | undefined) => {
  return useQuery({
    queryKey: ["blog-post", id],
    queryFn: async (): Promise<BlogPost | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useBlogCategories = () => {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("category");
      if (error) throw error;
      const unique = [...new Set(data.map((d) => d.category))];
      return ["All", ...unique.sort()];
    },
  });
};
