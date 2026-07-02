import { useQuery, useMutation } from "@tanstack/react-query";
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

interface SubscribeInput { email: string; website?: string }

export const useSubscribe = () => {
  return useMutation({
    mutationFn: async (input: SubscribeInput | string) => {
      const email = typeof input === "string" ? input : input.email;
      const website = typeof input === "string" ? "" : input.website ?? "";
      const parsed = newsletterSchema.parse({ email });

      const { data, error } = await supabase.functions.invoke("public-submit", {
        body: { action: "newsletter", payload: { email: parsed.email.toLowerCase(), website } },
      });
      if (error) {
        const msg = (data as { error?: string } | null)?.error ?? error.message ?? "Could not subscribe";
        throw new Error(msg);
      }
      if (data && (data as { error?: string }).error) {
        throw new Error((data as { error: string }).error);
      }
    },
  });
};
