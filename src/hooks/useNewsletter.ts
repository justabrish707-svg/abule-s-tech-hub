import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { newsletterSchema } from "@/lib/validation";

export interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

export const useSubscribers = () => {
  return useQuery({
    queryKey: ["newsletter-subscribers"],
    queryFn: async (): Promise<Subscriber[]> => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useSubscribe = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const parsed = newsletterSchema.parse({ email });
      const { error } = await supabase.from("newsletter_subscribers").insert({ email: parsed.email.toLowerCase() });
      if (error) {
        if (error.code === "23505") throw new Error("You're already subscribed!");
        throw error;
      }
    },
  });
};
