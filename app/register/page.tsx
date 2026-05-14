"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await register(email.trim(), password, fullName.trim());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="card w-full max-w-md p-7">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          Eight-character minimum password. We hash it with bcrypt.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm">Full name</label>
            <input
              required
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Password</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Confirm password</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              className="input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          {error && (
            <div className="rounded-md border border-[color:var(--danger)]/40 bg-[color:var(--danger)]/10 px-3 py-2 text-sm text-[color:var(--danger)]">
              {error}
            </div>
          )}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-[color:var(--muted)]">
          Already registered?{" "}
          <Link href="/login" className="text-[color:var(--primary-hover)] underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
