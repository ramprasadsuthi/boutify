import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import {
  Network,
  LayoutDashboard,
  GitBranch,
  Users,
  Settings,
  LogOut,
  Store,
  Activity,
  Coins,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import logoUrl from "@/assets/boutify/logo.png";

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
    if (role === "boutique_owner") {
      items.push({ to: "/app/boutique", label: "My Boutique", icon: Store });
    }
    if (role === "admin") {
      items.push({ to: "/users", label: "Users", icon: Users });
      items.push({ to: "/credits", label: "Credit Mgmt", icon: Coins });
      items.push({ to: "/transactions", label: "Transactions", icon: Activity });
      items.push({ to: "/app/network", label: "Genealogy", icon: GitBranch });
    }
  }

  items.push({ to: "/app/settings", label: "Settings", icon: Settings });

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={`space-y-1.5 ${mobile ? "" : "px-4"}`}>
      {items.map((it) => {
        const active = path === it.to;
        const link = (
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

        return mobile ? (
          <SheetClose asChild key={it.to}>
            {link}
          </SheetClose>
        ) : (
          link
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-gradient-soft">
      {/* Mobile Top Nav */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex h-full flex-col bg-sidebar">
                <div className="px-6 py-8">
                  <div className="flex items-center gap-3">
                    <img src={logoUrl} alt="Boutify Logo" className="h-20 w-auto object-contain -my-6" />
                  </div>
                </div>
                <div className="px-4 flex-1">
                  <NavLinks mobile />
                </div>
                <div className="p-4 mt-auto">
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-2 rounded-xl"
                    onClick={async () => {
                      await signOut();
                      nav({ to: "/" });
                    }}
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center gap-2">
            <img src={logoUrl} alt="Boutify Logo" className="h-16 w-auto object-contain -my-4" />
          </Link>
        </div>
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
            <img src={logoUrl} alt="Boutify Logo" className="h-20 w-auto object-contain -my-6" />
            <div className="flex flex-col justify-center">
              <span className="text-[9px] uppercase tracking-[0.2em] font-black text-primary leading-none mt-1">
                Network Pro
              </span>
            </div>
          </Link>
        </div>

        <div className="px-4 mb-6">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <NavLinks />

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
                    <div className="truncate text-sm font-bold text-foreground">
                      {profile?.full_name ?? "User"}
                    </div>
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

export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-border p-6 shadow-soft ${accent ? "bg-gradient-primary text-primary-foreground" : "bg-card"}`}
    >
      <div
        className={`text-xs font-medium uppercase tracking-wide ${accent ? "opacity-90" : "text-muted-foreground"}`}
      >
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}
