import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Copy, Share2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const { profile, loading: authLoading, signOut, apiBase } = useAuth();
  const nav = useNavigate();
  const [dataLoading, setDataLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, customers: 0, owners: 0, referrals: 0, pending: 0, active: 0, direct: 0, network: 0 });
  const [series, setSeries] = useState<{ day: string; users: number }[]>([]);
  const [parent, setParent] = useState<string | null>(null);

  const role = profile?.user_type;

  useEffect(() => {
    if (!profile || !role) return;

    (async () => {
      try {
        setDataLoading(true);
        const res = await fetch(`${apiBase}/api/dashboard/stats?userId=${profile.id}&role=${role}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);

        setStats({
          users: data.usersCount,
          customers: data.customersCount,
          owners: data.ownersCount,
          referrals: data.referralsCount,
          pending: data.pendingCount,
          active: data.activeCount,
          direct: data.directCount,
          network: data.networkCount,
        });

        if (data.sponsorName) setParent(data.sponsorName);

        // 14-day growth chart
        const list = data.allUsers;
        const days: { day: string; users: number }[] = [];
        const now = new Date();
        for (let i = 13; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          const count = list.filter((u: any) => u.created_at?.slice(0, 10) <= key).length;
          days.push({ day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), users: count });
        }
        setSeries(days);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message);
      } finally {
        setDataLoading(false);
      }
    })();
  }, [profile, role]);

  const referralLink = profile?.referral_code
    ? `${window.location.origin}${window.location.pathname.replace(/\/$/, '')}/#/register?ref=${profile.referral_code}`
    : null;

  const handleShare = async () => {
    if (!referralLink) {
      toast.error("Referral link not available");
      return;
    }
    
    // 1. Immediate Open (to avoid popup blocker)
    try {
      const win = window.open(referralLink, '_blank');
      if (!win) {
        // If blocked, we fallback to clipboard and notify
        toast.info("Popup blocked, but link copied to clipboard!");
      } else {
        toast.success("Opening registration page...");
      }
    } catch (e) {
      console.error("Window open failed", e);
    }

    // 2. Clipboard Copy
    try {
      await navigator.clipboard.writeText(referralLink);
    } catch (err) {
      console.warn("Clipboard copy failed", err);
    }

    // 3. Native Share (Optional mobile experience)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Boutify',
          text: `Use my code ${profile?.referral_code} to join my network!`,
          url: referralLink,
        });
      } catch (err) {
        // Silently ignore share cancellation
      }
    }
  };

  const isLoading = authLoading || dataLoading;

  return (
    <div className="space-y-8 p-6 md:p-10">
      <div className="flex items-start justify-between">
        <div>
          {isLoading ? (
            <>
              <Skeleton className="h-9 w-48 mb-2" />
              <Skeleton className="h-5 w-32" />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.full_name?.split(" ")[0]}</h1>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {role?.replace("_", " ")}
                </span>
                <span className="text-sm text-muted-foreground">Personalized Dashboard</span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="hidden md:flex gap-2 rounded-xl border-border/50 hover:bg-destructive hover:text-destructive-foreground"
            onClick={async () => {
              await signOut();
              nav({ to: "/" });
            }}
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-2xl border border-border p-6 bg-card shadow-soft space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Profile Details</h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span className="text-sm text-muted-foreground">Full Name</span>
                  <span className="text-sm font-semibold">{profile?.full_name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span className="text-sm text-muted-foreground">Mobile</span>
                  <span className="text-sm font-semibold">{profile?.mobile ?? "—"}</span>
                </div>
                {profile?.boutique_name && (
                  <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="text-sm text-muted-foreground">Boutique</span>
                    <span className="text-sm font-semibold">{profile.boutique_name}</span>
                  </div>
                )}
                {role === "customer" && (
                  <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="text-sm text-muted-foreground">Wallet Balance</span>
                    <span className="text-sm font-semibold text-emerald-600">₹{profile.wallet_balance || "0.00"}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                    profile?.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 
                    profile?.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 
                    'bg-rose-500/10 text-rose-500'
                  }`}>
                    {profile?.status}
                  </span>
                </div>
              </div>
            </div>

            {role === "customer" && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft md:col-span-1 lg:col-span-2">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Referral Program</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Share your code to grow your network and earn rewards.</p>
                    <div className="mt-6">
                      <div className="text-sm font-medium text-muted-foreground">Your unique referral code</div>
                      <div className="mt-1 font-mono text-3xl font-extrabold text-gradient-primary tracking-tighter">{profile?.referral_code}</div>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 min-w-[140px] rounded-xl"
                      onClick={() => {
                        const code = profile?.referral_code;
                        if (!code) return;
                        if (navigator.clipboard && window.isSecureContext) {
                          navigator.clipboard.writeText(code)
                            .then(() => toast.success("Code copied"))
                            .catch(() => {
                              const el = document.createElement('textarea');
                              el.value = code;
                              document.body.appendChild(el);
                              el.select();
                              document.execCommand('copy');
                              document.body.removeChild(el);
                              toast.success("Code copied");
                            });
                        } else {
                          const el = document.createElement('textarea');
                          el.value = code;
                          document.body.appendChild(el);
                          el.select();
                          document.execCommand('copy');
                          document.body.removeChild(el);
                          toast.success("Code copied");
                        }
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" /> Copy Code
                    </Button>
                    <Button
                      className="flex-1 min-w-[140px] bg-gradient-primary text-primary-foreground shadow-soft rounded-xl"
                      onClick={handleShare}
                    >
                      <Share2 className="mr-2 h-4 w-4" /> Share Link
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
            {role === "admin" && (
              <>
                <StatCard label="Total Users" value={stats.users} accent />
                <StatCard label="Customers" value={stats.customers} />
                <StatCard label="Boutique Owners" value={stats.owners} />
                <StatCard label="Pending" value={stats.pending} />
              </>
            )}

            {role === "boutique_owner" && (
              <>
                <StatCard label="Total Customers" value={stats.customers} accent />
                <StatCard label="Active" value={stats.active} />
                <StatCard label="New (30d)" value={stats.customers} />
                <StatCard label="Network Size" value={stats.referrals} />
              </>
            )}

            {role === "customer" && (
              <>
                <StatCard label="Direct Referrals" value={stats.direct} accent />
                <StatCard label="Total Network" value={stats.network} />
                <StatCard label="Sponsor" value={parent ?? "—"} />
                <StatCard label="Active Status" value={profile!.status} />
              </>
            )}
          </div>
        </>
      )}

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-lg font-semibold">Network growth</h2>
        <p className="text-sm text-muted-foreground">Cumulative platform users (14 days)</p>
        <div className="mt-6 h-64">
          {isLoading ? (
            <Skeleton className="w-full h-full rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="oklch(0.55 0.22 295)" />
                    <stop offset="100%" stopColor="oklch(0.72 0.18 50)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 290)" />
                <XAxis dataKey="day" stroke="oklch(0.5 0.03 280)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.03 280)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.02 290)" }} />
                <Line type="monotone" dataKey="users" stroke="url(#g1)" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
