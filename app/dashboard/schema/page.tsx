"use client";

import { useEffect, useState } from "react";
import { api, type SchemaTable } from "@/lib/api";

export default function SchemaPage() {
  const [tables, setTables] = useState<SchemaTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api<{ schema: string; tables: SchemaTable[] }>("/api/schema")
      .then((d) => setTables(d.tables))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Warehouse schema</h1>
      <p className="mt-1 text-sm text-[color:var(--muted)]">
        Tables, columns, and approximate row counts in <code className="mono">retail_dw</code>.
      </p>

      {loading && <div className="mt-6 text-sm text-[color:var(--muted)]">Loading…</div>}
      {error && (
        <div className="mt-6 rounded-md border border-[color:var(--danger)]/40 bg-[color:var(--danger)]/10 px-4 py-3 text-sm text-[color:var(--danger)]">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {tables.map((t) => {
          const open = expanded === t.name;
          return (
            <div key={t.name} className="card">
              <button
                onClick={() => setExpanded(open ? null : t.name)}
                className="flex w-full items-center justify-between px-5 py-3 text-left"
              >
                <div>
                  <div className="font-medium mono">{t.name}</div>
                  {t.comment && (
                    <div className="mt-0.5 text-xs text-[color:var(--muted)]">{t.comment}</div>
                  )}
                </div>
                <div className="text-xs text-[color:var(--muted)]">
                  {t.approx_row_count != null ? `${t.approx_row_count.toLocaleString()} rows` : ""}
                </div>
              </button>
              {open && (
                <div className="border-t border-[color:var(--border)] px-5 py-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider text-[color:var(--muted)]">
                        <th className="py-1">Column</th>
                        <th className="py-1">Type</th>
                        <th className="py-1">Nullable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {t.columns.map((c) => (
                        <tr key={c.name} className="border-t border-[color:var(--border)]/60">
                          <td className="py-1.5 mono text-xs">{c.name}</td>
                          <td className="py-1.5 text-xs text-[color:var(--muted)]">{c.type}</td>
                          <td className="py-1.5 text-xs text-[color:var(--muted)]">{c.nullable ? "yes" : "no"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
