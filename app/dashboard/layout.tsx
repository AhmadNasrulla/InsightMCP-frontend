"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

const NAV = [
  { href: "/dashboard", label: "Ask" },
  { href: "/dashboard/schema", label: "Schema" },
  { href: "/dashboard/history", label: "History" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-[color:var(--muted)]">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="hidden w-60 shrink-0 border-r border-[color:var(--border)] bg-[color:var(--background-elevated)] p-4 md:flex md:flex-col">
        <div className="px-2 py-3">
          <div className="text-sm font-semibold tracking-tight">Retail Analyst</div>
          <div className="text-xs text-[color:var(--muted)]">MCP · PostgreSQL · Gemini</div>
        </div>
        <nav className="mt-3 flex flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "rounded-md px-3 py-2 text-sm transition-colors " +
                  (active
                    ? "bg-[color:var(--surface-2)] text-[color:var(--foreground)]"
                    : "text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)]")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-3 text-sm">
          <div className="truncate font-medium">{user.full_name}</div>
          <div className="truncate text-xs text-[color:var(--muted)]">{user.email}</div>
          <button onClick={logout} className="mt-3 w-full btn-secondary text-xs">
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-[color:var(--border)] bg-[color:var(--background-elevated)]/60 px-6 py-3 md:hidden">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Retail Analyst</div>
            <button onClick={logout} className="btn-secondary text-xs">Sign out</button>
          </div>
          <nav className="mt-2 flex gap-2 overflow-x-auto">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}
                className={
                  "rounded-md px-3 py-1 text-xs " +
                  (pathname === item.href ? "bg-[color:var(--surface-2)]" : "text-[color:var(--muted)]")
                }>
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <div className="flex-1 overflow-y-auto scrollbar-thin">{children}</div>
      </main>
    </div>
  );
}
