// Per-finding review notes + audit trail, persisted in Supabase so changes
// remain consistent across sessions and users. Admin-only via RLS.

import { supabase } from "@/integrations/supabase/client";

export type AuditAction = "note" | "status" | "reviewed";
export type FindingStatus = "open" | "fixed" | "accepted";

export interface AuditEntry {
  id: string;
  findingId: string;
  ts: string;
  action: AuditAction;
  message: string;
  author?: string;
}

export interface FindingStatusRow {
  finding_id: string;
  status: FindingStatus;
  updated_at: string;
}

export const fetchAuditTrail = async (): Promise<AuditEntry[]> => {
  const { data, error } = await supabase
    .from("security_audit_trail")
    .select("id, finding_id, action, message, author_email, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    findingId: r.finding_id,
    ts: r.created_at,
    action: r.action as AuditAction,
    message: r.message,
    author: r.author_email ?? undefined,
  }));
};

export const appendAudit = async (entry: {
  findingId: string;
  action: AuditAction;
  message: string;
  author?: string;
  authorId?: string;
}): Promise<void> => {
  const { error } = await supabase.from("security_audit_trail").insert({
    finding_id: entry.findingId,
    action: entry.action,
    message: entry.message,
    author: entry.authorId ?? null,
    author_email: entry.author ?? null,
  });
  if (error) throw error;
};

export const fetchStatusOverrides = async (): Promise<Record<string, FindingStatus>> => {
  const { data, error } = await supabase
    .from("security_finding_status")
    .select("finding_id, status");
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((r) => [r.finding_id, r.status as FindingStatus]));
};

export const upsertStatus = async (findingId: string, status: FindingStatus, updatedBy?: string): Promise<void> => {
  const { error } = await supabase
    .from("security_finding_status")
    .upsert(
      { finding_id: findingId, status, updated_by: updatedBy ?? null, updated_at: new Date().toISOString() },
      { onConflict: "finding_id" },
    );
  if (error) throw error;
};
