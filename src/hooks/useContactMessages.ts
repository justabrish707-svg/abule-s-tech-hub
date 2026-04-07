import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export const useSendContactMessage = () => {
  return useMutation({
    mutationFn: async (msg: { name: string; email: string; message: string }) => {
      const parsed = contactSchema.parse(msg);
      const { error } = await supabase.from("contact_messages").insert({
        name: parsed.name,
        email: parsed.email,
        message: parsed.message,
      });
      if (error) throw error;
    },
  });
};
