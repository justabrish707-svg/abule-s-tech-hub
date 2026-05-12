export interface ValidationIssue {
  level: "error" | "warning";
  line: number;
  message: string;
}

export const validateMarkdown = (content: string): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const lines = content.split("\n");

  let fenceOpen = false;
  let fenceLine = 0;
  let mathOpen = false;
  let mathLine = 0;

  lines.forEach((raw, i) => {
    const line = raw;
    const ln = i + 1;

    if (/^```/.test(line.trim())) {
      fenceOpen = !fenceOpen;
      if (fenceOpen) fenceLine = ln;
    }

    // $$ math block toggles
    const mathMatches = line.match(/\$\$/g);
    if (mathMatches) {
      for (let k = 0; k < mathMatches.length; k++) {
        mathOpen = !mathOpen;
        if (mathOpen) mathLine = ln;
      }
    }

    if (!fenceOpen) {
      // Image / link bracket balance per line
      const imgs = line.match(/!\[[^\]]*\]\([^)]*\)/g) || [];
      const malformedImg = /!\[[^\]]*\](?!\()/.test(line.replace(/!\[[^\]]*\]\([^)]*\)/g, ""));
      if (malformedImg) issues.push({ level: "warning", line: ln, message: "Image syntax may be missing URL: ![alt](url)" });

      // Empty alt text
      imgs.forEach((m) => {
        if (/^!\[\s*\]/.test(m)) issues.push({ level: "warning", line: ln, message: "Image missing alt text (hurts a11y & SEO)" });
        if (/\(\s*\)/.test(m)) issues.push({ level: "error", line: ln, message: "Image has empty URL" });
      });

      // Table row that doesn't look balanced
      if (/^\s*\|.*\|\s*$/.test(line) && lines[i + 1] && /^\s*\|?\s*:?-+/.test(lines[i + 1])) {
        const headerCols = line.split("|").filter((s) => s.trim() !== "").length;
        const sepCols = lines[i + 1].split("|").filter((s) => s.trim() !== "").length;
        if (headerCols !== sepCols) {
          issues.push({ level: "error", line: ln + 1, message: `Table header has ${headerCols} cols but separator has ${sepCols}` });
        }
      }
    }
  });

  if (fenceOpen) issues.push({ level: "error", line: fenceLine, message: "Unclosed code fence (```)" });
  if (mathOpen) issues.push({ level: "error", line: mathLine, message: "Unclosed math block ($$)" });

  return issues;
};
