// Dynamic Open Graph image generator (SVG, 1200x630).
// Usage: /functions/v1/og-image?title=...&category=...&author=...

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

// Wrap text into lines of approx N chars without breaking words.
const wrap = (text: string, max: number, maxLines: number): string[] => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
    if (lines.length === maxLines) break;
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    lines[maxLines - 1] = lines[maxLines - 1].replace(/.{0,3}$/, "…");
  }
  return lines;
};

Deno.serve((req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const url = new URL(req.url);
  const title = (url.searchParams.get("title") || "Abule Tech").slice(0, 140);
  const category = (url.searchParams.get("category") || "").slice(0, 40);
  const author = (url.searchParams.get("author") || "Abraham Admasu").slice(0, 60);

  const lines = wrap(title, 28, 4);
  const startY = 220 + (4 - lines.length) * 40;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0f1a"/>
      <stop offset="100%" stop-color="#0f1f17"/>
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="20%" r="50%">
      <stop offset="0%" stop-color="#22c55e" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#22c55e" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-opacity="0.04" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <g transform="translate(80, 80)">
    <circle cx="20" cy="20" r="18" fill="#22c55e"/>
    <text x="52" y="28" font-family="Inter, system-ui, sans-serif" font-size="24" font-weight="700" fill="#e5e7eb">Abule Tech</text>
  </g>

  ${category ? `<g transform="translate(80, ${startY - 70})">
    <rect rx="14" ry="14" width="${category.length * 13 + 28}" height="40" fill="#22c55e" fill-opacity="0.15" stroke="#22c55e" stroke-opacity="0.4"/>
    <text x="14" y="26" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="600" fill="#4ade80">${escapeXml(category)}</text>
  </g>` : ""}

  <g font-family="Inter, system-ui, sans-serif" font-weight="800" fill="#f9fafb">
    ${lines.map((l, i) => `<text x="80" y="${startY + i * 80}" font-size="68">${escapeXml(l)}</text>`).join("")}
  </g>

  <g transform="translate(80, 540)">
    <text font-family="Inter, system-ui, sans-serif" font-size="22" fill="#9ca3af">By ${escapeXml(author)}</text>
    <text x="1040" font-family="Inter, system-ui, sans-serif" font-size="22" fill="#9ca3af" text-anchor="end">abule-tech.lovable.app</text>
  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      ...CORS,
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
    },
  });
});
