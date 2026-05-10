/**
 * Transform a Supabase Storage public URL into an on-the-fly resized/optimized URL.
 * Falls back to the original URL if it isn't a Supabase storage public URL.
 */
export const supabaseImage = (
  url: string | null | undefined,
  opts: { width?: number; height?: number; quality?: number; resize?: "cover" | "contain" | "fill" } = {},
): string => {
  if (!url) return "";
  if (!url.includes("/storage/v1/object/public/")) return url;

  const transformed = url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  const [base, query = ""] = transformed.split("?");
  const params = new URLSearchParams(query);

  if (opts.width) params.set("width", String(opts.width));
  if (opts.height) params.set("height", String(opts.height));
  params.set("quality", String(opts.quality ?? 75));
  params.set("resize", opts.resize ?? "cover");

  return `${base}?${params.toString()}`;
};
