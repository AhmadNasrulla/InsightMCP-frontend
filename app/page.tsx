"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1 text-xs text-[color:var(--muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
          MCP-Powered Conversational BI
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
          Ask your retail warehouse in <span className="text-[color:var(--primary)]">plain English</span>.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[color:var(--muted)]">
          A controlled AI data analyst over a Kimball-style PostgreSQL warehouse.
          Natural language in, validated SQL and business explanations out.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/login" className="btn-primary">Sign in</Link>
          <Link href="/register" className="btn-secondary">Create account</Link>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            ["Semantic Layer", "Metrics, dimensions, synonyms, allowed joins — the LLM never guesses business meaning."],
            ["Safe Execution", "Read-only role, validator, statement timeout, row limits, full audit trail."],
            ["Industry MCP", "Standard MCP server exposes schema, semantic, and tools to any compatible client."],
          ].map(([title, body]) => (
            <div key={title} className="card p-5">
              <div className="text-sm font-medium">{title}</div>
              <div className="mt-2 text-sm text-[color:var(--muted)]">{body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
