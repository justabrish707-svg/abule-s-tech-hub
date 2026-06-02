// JSON-LD schema validation for the structured data emitted by SEO.tsx.
// Validates the four schema types this site uses: WebSite, Person, Article, CollectionPage.

export type JsonLdIssue = {
  severity: "error" | "warning";
  path: string;
  message: string;
};

export type JsonLdReport = {
  type: string;
  valid: boolean;
  issues: JsonLdIssue[];
};

type Schema = Record<string, unknown>;

const isNonEmptyString = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const isUrl = (v: unknown): boolean => {
  if (!isNonEmptyString(v)) return false;
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
};
const isIsoDate = (v: unknown): boolean => isNonEmptyString(v) && !Number.isNaN(Date.parse(v));

const requireField = (schema: Schema, field: string, issues: JsonLdIssue[], severity: "error" | "warning" = "error") => {
  if (schema[field] === undefined || schema[field] === null || schema[field] === "") {
    issues.push({ severity, path: field, message: `Missing required field "${field}".` });
    return false;
  }
  return true;
};

const validateWebSite = (s: Schema, issues: JsonLdIssue[]) => {
  requireField(s, "name", issues);
  if (requireField(s, "url", issues) && !isUrl(s.url)) {
    issues.push({ severity: "error", path: "url", message: "url must be a valid absolute URL." });
  }
};

const validatePerson = (s: Schema, issues: JsonLdIssue[]) => {
  requireField(s, "name", issues);
  if (s.url !== undefined && !isUrl(s.url)) {
    issues.push({ severity: "error", path: "url", message: "url must be a valid absolute URL." });
  }
  if (s.sameAs !== undefined) {
    if (!Array.isArray(s.sameAs)) {
      issues.push({ severity: "error", path: "sameAs", message: "sameAs must be an array of URLs." });
    } else {
      s.sameAs.forEach((u, i) => {
        if (!isUrl(u)) issues.push({ severity: "error", path: `sameAs[${i}]`, message: "Not a valid URL." });
      });
    }
  }
};

const validateArticle = (s: Schema, issues: JsonLdIssue[]) => {
  requireField(s, "headline", issues);
  if (isNonEmptyString(s.headline) && (s.headline as string).length > 110) {
    issues.push({ severity: "warning", path: "headline", message: "headline should be ≤110 characters for Google." });
  }
  if (requireField(s, "datePublished", issues) && !isIsoDate(s.datePublished)) {
    issues.push({ severity: "error", path: "datePublished", message: "datePublished must be a valid ISO date." });
  }
  if (s.dateModified !== undefined && !isIsoDate(s.dateModified)) {
    issues.push({ severity: "error", path: "dateModified", message: "dateModified must be a valid ISO date." });
  }
  const author = s.author as Schema | undefined;
  if (!author || typeof author !== "object") {
    issues.push({ severity: "error", path: "author", message: "Missing author object." });
  } else {
    if (!isNonEmptyString(author.name)) {
      issues.push({ severity: "error", path: "author.name", message: "author.name is required." });
    }
  }
  if (s.image !== undefined && !isUrl(s.image) && !Array.isArray(s.image)) {
    issues.push({ severity: "warning", path: "image", message: "image should be a valid URL or array of URLs." });
  } else if (!s.image) {
    issues.push({ severity: "warning", path: "image", message: "Adding an image improves rich-result eligibility." });
  }
  if (s.mainEntityOfPage !== undefined && !isUrl(s.mainEntityOfPage)) {
    issues.push({ severity: "error", path: "mainEntityOfPage", message: "mainEntityOfPage must be a URL." });
  }
};

const validateCollectionPage = (s: Schema, issues: JsonLdIssue[]) => {
  requireField(s, "name", issues);
  if (s.url !== undefined && !isUrl(s.url)) {
    issues.push({ severity: "error", path: "url", message: "url must be a valid absolute URL." });
  }
};

export const validateJsonLd = (raw: unknown): JsonLdReport => {
  const issues: JsonLdIssue[] = [];
  if (!raw || typeof raw !== "object") {
    return { type: "unknown", valid: false, issues: [{ severity: "error", path: "$", message: "Not a JSON-LD object." }] };
  }
  const s = raw as Schema;
  const ctx = s["@context"];
  const type = (s["@type"] as string) || "unknown";

  if (ctx !== "https://schema.org") {
    issues.push({ severity: "error", path: "@context", message: '@context must be "https://schema.org".' });
  }
  if (!isNonEmptyString(s["@type"])) {
    issues.push({ severity: "error", path: "@type", message: "Missing @type." });
  }

  switch (type) {
    case "WebSite":
      validateWebSite(s, issues);
      break;
    case "Person":
      validatePerson(s, issues);
      break;
    case "Article":
      validateArticle(s, issues);
      break;
    case "CollectionPage":
      validateCollectionPage(s, issues);
      break;
    default:
      issues.push({ severity: "warning", path: "@type", message: `Unsupported @type "${type}" (validator covers WebSite, Person, Article, CollectionPage).` });
  }

  return {
    type,
    valid: issues.every((i) => i.severity !== "error"),
    issues,
  };
};

export const validateJsonLdBatch = (items: unknown[]): JsonLdReport[] => items.map(validateJsonLd);
