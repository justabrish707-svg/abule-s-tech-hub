// Persist and diff full security scan snapshots so admins can compare any
// two runs and see what changed. Access is admin-only via RLS.

import { supabase } from "@/integrations/supabase/client";
import type { FindingStatus } from "@/lib/securityAudit";

export interface SnapshotFinding {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  source: string;
  title: string;
  location?: string;
  status: FindingStatus;
  note?: string;
}

export interface ScanSnapshot {
  id: string;
  label: string;
  source: string;
  findings: SnapshotFinding[];
  totalCount: number;
  openCount: number;
  fixedCount: number;
  createdAt: string;
}

export interface SnapshotDiff {
  added: SnapshotFinding[];
  removed: SnapshotFinding[];
  reopened: SnapshotFinding[];
  newlyFixed: SnapshotFinding[];
  unchanged: SnapshotFinding[];
}

export const listSnapshots = async (): Promise<ScanSnapshot[]> => {
  const { data, error } = await supabase
    .from("security_scan_snapshots")
    .select("id, label, source, findings, total_count, open_count, fixed_count, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    label: r.label,
    source: r.source,
    findings: (r.findings as unknown as SnapshotFinding[]) ?? [],
    totalCount: r.total_count,
    openCount: r.open_count,
    fixedCount: r.fixed_count,
    createdAt: r.created_at,
  }));
};

export const saveSnapshot = async (input: {
  label: string;
  source?: string;
  findings: SnapshotFinding[];
  createdBy?: string;
}): Promise<ScanSnapshot> => {
  const open = input.findings.filter((f) => f.status === "open").length;
  const fixed = input.findings.filter((f) => f.status === "fixed").length;
  const { data, error } = await supabase
    .from("security_scan_snapshots")
    .insert({
      label: input.label,
      source: input.source ?? "manual",
      findings: input.findings as unknown as never,
      total_count: input.findings.length,
      open_count: open,
      fixed_count: fixed,
      created_by: input.createdBy ?? null,
    })
    .select("id, label, source, findings, total_count, open_count, fixed_count, created_at")
    .single();
  if (error) throw error;
  return {
    id: data.id,
    label: data.label,
    source: data.source,
    findings: (data.findings as unknown as SnapshotFinding[]) ?? [],
    totalCount: data.total_count,
    openCount: data.open_count,
    fixedCount: data.fixed_count,
    createdAt: data.created_at,
  };
};

export const deleteSnapshot = async (id: string): Promise<void> => {
  const { error } = await supabase.from("security_scan_snapshots").delete().eq("id", id);
  if (error) throw error;
};

// `base` is the older run; `head` is the newer run.
export const diffSnapshots = (base: ScanSnapshot, head: ScanSnapshot): SnapshotDiff => {
  const baseMap = new Map(base.findings.map((f) => [f.id, f]));
  const headMap = new Map(head.findings.map((f) => [f.id, f]));

  const added: SnapshotFinding[] = [];
  const removed: SnapshotFinding[] = [];
  const reopened: SnapshotFinding[] = [];
  const newlyFixed: SnapshotFinding[] = [];
  const unchanged: SnapshotFinding[] = [];

  for (const [id, f] of headMap) {
    const prev = baseMap.get(id);
    if (!prev) {
      added.push(f);
      continue;
    }
    if (prev.status !== "fixed" && f.status === "fixed") newlyFixed.push(f);
    else if (prev.status === "fixed" && f.status !== "fixed") reopened.push(f);
    else unchanged.push(f);
  }
  for (const [id, f] of baseMap) {
    if (!headMap.has(id)) removed.push(f);
  }
  return { added, removed, reopened, newlyFixed, unchanged };
};
