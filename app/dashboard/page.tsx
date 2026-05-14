"use client";

import { useState } from "react";
import { api, ApiError, type AskResponse } from "@/lib/api";

const SAMPLE_QUESTIONS = [
  "What is total net sales by category for 2025?",
  "Top 10 products by revenue this year",
  "Which store has the highest average order value in Punjab?",
  "Show monthly sales trend for Electronics in 2025",
  "Which subcategory has the highest return rate?",
  "Compare profit margin by region",
];

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "number") {
    if (Number.isInteger(v)) return v.toLocaleString();
    return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(q?: string) {
    const finalQ = (q ?? question).trim();
    if (!finalQ) return;
    setQuestion(finalQ);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await api<AskResponse>("/api/analyst/ask", {
        method: "POST",
        body: { question: finalQ, execute: true },
      });
      setResult(resp);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Ask your warehouse</h1>
      <p className="mt-1 text-sm text-[color:var(--muted)]">
        Plain-English questions are turned into validated, read-only SQL and executed against the retail data warehouse.
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="mt-6 card p-4"
      >
        <textarea
          className="input min-h-[110px] resize-y"
          placeholder="e.g. Which 10 products generated the highest revenue in Q2 2025?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => submit(s)}
                className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 py-1 text-xs text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              >
                {s}
              </button>
            ))}
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Thinking…" : "Ask"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-6 rounded-md border border-[color:var(--danger)]/40 bg-[color:var(--danger)]/10 px-4 py-3 text-sm text-[color:var(--danger)]">
          {error}
        </div>
      )}

      {result && <ResultPanel result={result} />}
    </div>
  );
}

function ResultPanel({ result }: { result: AskResponse }) {
  if (result.refused) {
    return (
      <div className="mt-6 card p-5">
        <div className="text-sm font-medium text-[color:var(--warning)]">Request refused</div>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {result.refusal_reason || "The analyst rejected this request."}
        </p>
        {result.sql && (
          <pre className="mt-3 max-h-60 overflow-auto scrollbar-thin rounded-md bg-[color:var(--surface-2)] p-3 text-xs">
            <code>{result.sql}</code>
          </pre>
        )}
      </div>
    );
  }

  if (result.clarification) {
    return (
      <div className="mt-6 card p-5">
        <div className="text-sm font-medium text-[color:var(--accent)]">Clarification needed</div>
        <p className="mt-2 text-sm">{result.clarification}</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {result.explanation && (
        <div className="card p-5">
          <div className="text-xs font-medium uppercase tracking-wider text-[color:var(--muted)]">Answer</div>
          <p className="mt-2 text-base leading-relaxed">{result.explanation}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat label="Rows" value={result.row_count.toLocaleString()} sublabel={result.truncated ? "truncated" : undefined} />
        <Stat label="Latency" value={result.execution_ms != null ? `${result.execution_ms} ms` : "—"} />
        <Stat
          label="Suggested chart"
          value={result.chart_suggestion?.chart_type ?? "—"}
          sublabel={result.chart_suggestion && result.chart_suggestion.x
            ? `${result.chart_suggestion.x} → ${result.chart_suggestion.y ?? ""}`
            : undefined}
        />
      </div>

      {result.reasoning && (
        <div className="card p-5">
          <div className="text-xs font-medium uppercase tracking-wider text-[color:var(--muted)]">Reasoning</div>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--foreground)]">{result.reasoning}</p>
        </div>
      )}

      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-wider text-[color:var(--muted)]">Generated SQL</div>
          <button
            onClick={() => navigator.clipboard.writeText(result.sql)}
            className="text-xs text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
          >
            Copy
          </button>
        </div>
        <pre className="mt-3 max-h-80 overflow-auto scrollbar-thin rounded-md bg-[color:var(--surface-2)] p-3 text-xs">
          <code>{result.sql}</code>
        </pre>
      </div>

      {result.columns.length > 0 && <ResultTable columns={result.columns} rows={result.rows} />}
    </div>
  );
}

function Stat({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-[color:var(--muted)]">{label}</div>
      <div className="mt-1 text-xl font-semibold tracking-tight">{value}</div>
      {sublabel && <div className="mt-0.5 text-xs text-[color:var(--muted)]">{sublabel}</div>}
    </div>
  );
}

function ResultTable({ columns, rows }: { columns: string[]; rows: unknown[][] }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 pt-4 text-xs font-medium uppercase tracking-wider text-[color:var(--muted)]">Result</div>
      <div className="mt-3 max-h-[500px] overflow-auto scrollbar-thin">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-[color:var(--surface-2)] text-xs uppercase tracking-wider text-[color:var(--muted)]">
            <tr>
              {columns.map((c) => (
                <th key={c} className="border-b border-[color:var(--border)] px-3 py-2 text-left font-medium">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-[color:var(--surface-2)]/50">
                {r.map((v, j) => (
                  <td key={j} className="border-b border-[color:var(--border)]/60 px-3 py-2 align-top mono text-xs">
                    {formatCell(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
