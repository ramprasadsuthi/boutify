import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Network, LayoutDashboard, GitBranch, Users, Settings, LogOut, Store, Activity, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, signOut, loading } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const role = profile?.user_type;
  const items: { to: string; label: string; icon: any }[] = [
    { to: "/app", label: "Dashboard", icon: LayoutDashboard },
  ];

  if (profile) {
    if (role === "customer") {
      items.push({ to: "/app/network", label: "My Network", icon: GitBranch });
    }
    if (role === "admin") {
      items.push({ to: "/users", label: "Users", icon: Users });
      items.push({ to: "/credits", label: "Credit Mgmt", icon: Coins });
      items.push({ to: "/transactions", label: "Transactions", icon: Activity });
      items.push({ to: "/app/network", label: "Genealogy", icon: GitBranch });
    }
    if (role === "boutique_owner") {
      items.push({ to: "/app/customers", label: "Customers", icon: Users });
      items.push({ to: "/app/boutique", label: "Boutique", icon: Store });
    }
  }
  
  items.push({ to: "/app/settings", label: "Settings", icon: Settings });

  return (
    <div className="flex min-h-screen bg-gradient-soft">
      {/* Mobile Top Nav */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-soft">
            <Network className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-base font-bold">Bouti<span className="text-gradient-primary">fy</span></span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={async () => {
            await signOut();
            nav({ to: "/" });
          }}
        >
          <LogOut className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>

      <aside className="hidden w-64 flex-col border-r border-border bg-sidebar md:flex">
        <div className="px-6 py-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
              <Network className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight">Bouti<span className="text-gradient-primary">fy</span></span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground opacity-70">Network Pro</span>
            </div>
          </Link>
        </div>

        <div className="px-4 mb-6">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <nav className="flex-1 space-y-1.5 px-4">
          {items.map((it) => {
            const active = path === it.to;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  active
                    ? "bg-gradient-primary text-primary-foreground shadow-elegant scale-[1.02]"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:translate-x-1"
                }`}
              >
                <it.icon className={`h-4 w-4 ${active ? "text-white" : "text-primary"}`} />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-border/50 bg-background/40 p-4 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              {!profile && loading ? (
                <>
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground ring-4 ring-primary/10">
                    {profile?.full_name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{profile?.full_name ?? "User"}</div>
                    <div className="truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {role?.replace("_", " ") ?? "Loading..."}
                    </div>
                  </div>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center gap-2 rounded-xl border-border/50 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
              onClick={async () => {
                await signOut();
                nav({ to: "/" });
              }}
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden pt-16 md:pt-0">{children}</main>
    </div>
  );
}

export function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border border-border p-6 shadow-soft ${accent ? "bg-gradient-primary text-primary-foreground" : "bg-card"}`}>
      <div className={`text-xs font-medium uppercase tracking-wide ${accent ? "opacity-90" : "text-muted-foreground"}`}>{label}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}
