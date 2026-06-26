import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  userid: string | null;
  mobile: string | null;
  user_type: "admin" | "boutique_owner" | "customer";
  status: "active" | "pending" | "restricted";
  referral_code: string | null;
  referred_by: string | null;
  boutique_name: string | null;
  wallet_balance?: string | number | null;
  created_at: string;
};

type Ctx = {
  user: { id: string } | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  apiBase: string;
};

const AuthCtx = createContext<Ctx | undefined>(undefined);

export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiBase, setApiBase] = useState(localStorage.getItem("api_base") || API_BASE);

  const switchApi = (url: string) => {
    setApiBase(url);
    localStorage.setItem("api_base", url);
  };

  const loadProfile = async (token: string, currentApi: string) => {
    try {
      const res = await fetch(`${currentApi}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setUser({ id: data.id });
      } else {
        localStorage.removeItem("token");
        setProfile(null);
        setUser(null);
      }
    } catch (err) {
      console.error(err);
      setProfile(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      loadProfile(token, apiBase);
    } else {
      setLoading(false);
    }
  }, [apiBase]);

  return (
    <AuthCtx.Provider
      value={{
        user,
        profile,
        loading,
        apiBase,
        signOut: async () => {
          localStorage.removeItem("token");
          setProfile(null);
          setUser(null);
        },
        refreshProfile: async () => {
          const token = localStorage.getItem("token");
          if (token) await loadProfile(token, apiBase);
        },
        // We'll add this to the context so it can be switched
      }}
    >
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <div className="flex gap-2 rounded-full bg-background/80 p-1 backdrop-blur border border-border shadow-lg">
          <button
            onClick={() => switchApi("http://localhost:8787")}
            className={`px-3 py-1 text-[10px] font-bold rounded-full transition-colors ${apiBase === "http://localhost:8787" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            Cloudflare
          </button>
          <button
            onClick={() => switchApi("http://localhost:3000")}
            className={`px-3 py-1 text-[10px] font-bold rounded-full transition-colors ${apiBase === "http://localhost:3000" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            MySQL Direct
          </button>
        </div>
      </div>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
}
