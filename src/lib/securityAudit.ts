// Per-finding review notes + audit trail, persisted in localStorage.
// Each finding ID owns a list of audit entries (note added, status changed, etc.)
// so reviewers can see exactly what changed and when.

export type AuditAction = "note" | "status" | "reviewed";

export interface AuditEntry {
  id: string;
  findingId: string;
  ts: string;
  action: AuditAction;
  message: string;
  author?: string;
}

const KEY = "security-audit-trail";

export const readAuditTrail = (): AuditEntry[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuditEntry[]) : [];
  } catch {
    return [];
  }
};

const writeAuditTrail = (entries: AuditEntry[]): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
};

export const appendAudit = (entry: Omit<AuditEntry, "id" | "ts">): AuditEntry => {
  const full: AuditEntry = {
    ...entry,
    id: crypto.randomUUID(),
    ts: new Date().toISOString(),
  };
  const all = readAuditTrail();
  all.unshift(full);
  writeAuditTrail(all.slice(0, 500));
  return full;
};

export const auditForFinding = (findingId: string): AuditEntry[] =>
  readAuditTrail().filter((e) => e.findingId === findingId);
