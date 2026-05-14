"use client";

import { useEffect, useState } from "react";
import { api, type HistoryItem } from "@/lib/api";

function statusColor(status: string, safety: string): string {
  if (safety === "blocked" || safety === "refused") return "var(--warning)";
  if (status === "error") return "var(--danger)";
  if (status === "success") return "var(--success)";
  return "var(--muted)";
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    api<{ items: HistoryItem[] }>("/api/history?limit=100")
      .then((d) => setItems(d.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Audit history</h1>
      <p className="mt-1 text-sm text-[color:var(--muted)]">
        Every question, the generated SQL, validation outcome, and execution status.
      </p>

      {loading && <div className="mt-6 text-sm text-[color:var(--muted)]">Loading…</div>}
      {error && (
        <div className="mt-6 rounded-md border border-[color:var(--danger)]/40 bg-[color:var(--danger)]/10 px-4 py-3 text-sm text-[color:var(--danger)]">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-2">
        {!loading && items.length === 0 && (
          <div className="text-sm text-[color:var(--muted)]">No questions yet — ask one on the Ask page.</div>
        )}
        {items.map((it) => {
          const expanded = open === it.id;
          return (
            <div key={it.id} className="card">
              <button
                onClick={() => setOpen(expanded ? null : it.id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{it.question}</div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-[color:var(--muted)]">
                    <span>{new Date(it.created_at).toLocaleString()}</span>
                    <span className="rounded-full px-2 py-0.5"
                      style={{ background: "var(--surface-2)", color: statusColor(it.status, it.safety_status) }}>
                      {it.safety_status === "safe" ? it.status : it.safety_status}
                    </span>
                    {it.row_count != null && <span>{it.row_count.toLocaleString()} rows</span>}
                    {it.execution_ms != null && <span>{it.execution_ms} ms</span>}
                  </div>
                </div>
              </button>
              {expanded && it.sql && (
                <pre className="border-t border-[color:var(--border)] bg-[color:var(--surface-2)] p-3 text-xs overflow-auto scrollbar-thin">
                  <code>{it.sql}</code>
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
