"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { api, setToken, getToken, type AuthResponse, type User } from "./api";

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api<User>("/api/auth/me")
      .then(setUser)
      .catch(() => {
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const resp = await api<AuthResponse>("/api/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    });
    setToken(resp.access_token);
    setUser(resp.user);
    router.push("/dashboard");
  }, [router]);

  const register = useCallback(
    async (email: string, password: string, fullName: string) => {
      const resp = await api<AuthResponse>("/api/auth/register", {
        method: "POST",
        auth: false,
        body: { email, password, full_name: fullName },
      });
      setToken(resp.access_token);
      setUser(resp.user);
      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo<AuthState>(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
