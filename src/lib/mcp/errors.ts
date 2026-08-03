/**
 * MCP tools must never leak Postgres/PostgREST internals (constraint names, RLS
 * policy names, column types) to callers. Log the detail server-side, return a
 * fixed generic message to the client.
 */
export const toolError = (scope: string, error: unknown) => {
  console.error(`[mcp:${scope}]`, error);
  return {
    content: [{ type: "text" as const, text: "Could not complete request." }],
    isError: true,
  };
};

/**
 * PostgREST `.or()` takes a raw filter string, so commas, parentheses and dots
 * in user input can alter the query. Strip them before interpolation.
 */
export const sanitizeFilterTerm = (term: string): string =>
  term.replace(/[,().*\\%]/g, " ").trim().slice(0, 100);
