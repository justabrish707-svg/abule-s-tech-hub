import { supabase } from "@/integrations/supabase/client";

export interface CodeReviewInput {
  code: string;
  language?: string;
}

export const requestCodeReview = async (input: CodeReviewInput): Promise<string> => {
  const { data, error } = await supabase.functions.invoke<{ report?: string; error?: string }>("code-review", {
    body: input,
  });
  if (error) {
    // FunctionsHttpError carries the response; surface the server's safe message.
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      const body = (await ctx.json().catch(() => null)) as { error?: string } | null;
      if (body?.error) throw new Error(body.error);
    }
    throw new Error("Could not complete the review. Please try again.");
  }
  if (!data?.report) throw new Error(data?.error ?? "The review came back empty.");
  return data.report;
};
