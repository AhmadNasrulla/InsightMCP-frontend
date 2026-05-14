export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

const TOKEN_KEY = "mcp-sql-token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token === null) window.localStorage.removeItem(TOKEN_KEY);
  else window.localStorage.setItem(TOKEN_KEY, token);
}

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
};

export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, signal } = opts;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });
  const text = await res.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }
  if (!res.ok) {
    const detail =
      (payload && typeof payload === "object" && "detail" in (payload as Record<string, unknown>)
        ? String((payload as Record<string, unknown>).detail)
        : null) || res.statusText;
    throw new ApiError(res.status, detail, payload);
  }
  return payload as T;
}

export type User = {
  id: number;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type AskResponse = {
  question: string;
  sql: string;
  reasoning: string;
  clarification: string | null;
  refused: boolean;
  refusal_reason: string | null;
  columns: string[];
  rows: unknown[][];
  row_count: number;
  truncated: boolean;
  execution_ms: number | null;
  chart_suggestion: { chart_type: string; x?: string; y?: string; value_column?: string } | null;
  explanation: string | null;
  validation: Record<string, unknown>;
  audit_id: number | null;
};

export type SchemaTable = {
  name: string;
  comment: string | null;
  approx_row_count: number | null;
  columns: { name: string; type: string; nullable: boolean }[];
};

export type HistoryItem = {
  id: number;
  question: string;
  sql: string | null;
  status: string;
  safety_status: string;
  row_count: number | null;
  execution_ms: number | null;
  created_at: string;
};
