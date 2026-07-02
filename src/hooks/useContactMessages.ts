import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { contactSchema } from "@/lib/validation";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const useContactMessages = () => {
  return useQuery({
    queryKey: ["contact-messages"],
    queryFn: async (): Promise<ContactMessage[]> => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

interface SendInput { name: string; email: string; message: string; website?: string }

export const useSendContactMessage = () => {
  return useMutation({
    mutationFn: async (msg: SendInput) => {
      const parsed = contactSchema.parse({ name: msg.name, email: msg.email, message: msg.message });
      const { data, error } = await supabase.functions.invoke("public-submit", {
        body: {
          action: "contact",
          payload: { name: parsed.name, email: parsed.email, message: parsed.message, website: msg.website ?? "" },
        },
      });
      if (error) {
        const server = (data as { error?: string } | null)?.error ?? error.message ?? "Could not send message";
        throw new Error(server);
      }
      if (data && (data as { error?: string }).error) {
        throw new Error((data as { error: string }).error);
      }
    },
  });
};
