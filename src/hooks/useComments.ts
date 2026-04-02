import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: { username: string | null; avatar_url: string | null };
}

export const useComments = (postId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["comments", postId],
    queryFn: async (): Promise<Comment[]> => {
      const { data, error } = await supabase
        .from("comments")
        .select("*, profiles(username, avatar_url)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Comment[];
    },
    enabled: !!postId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!postId) return;
    const channel = supabase
      .channel(`comments-${postId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${postId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [postId, queryClient]);

  return query;
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, content, parentId, userId }: { postId: string; content: string; parentId?: string; userId: string }) => {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: userId,
        parent_id: parentId || null,
        content: content.trim(),
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["comments", vars.postId] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, postId }: { id: string; postId: string }) => {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw error;
      return postId;
    },
    onSuccess: (postId) => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
};
