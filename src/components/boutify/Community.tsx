import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { communityStats, topContributors, activityFeed } from "@/lib/data/boutify";
import { Sparkles, Clock, Loader2 } from "lucide-react";

interface BoutiqueOwner {
  id: string;
  full_name: string;
  boutique_name: string;
  city: string;
  created_at: string;
}

export function Community() {
  const { apiBase } = useAuth();
  const [recentBoutiques, setRecentBoutiques] = useState<BoutiqueOwner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentBoutiques() {
      try {
        const res = await fetch(`${apiBase}/api/boutiques`);
        if (res.ok) {
          const data = await res.json();
          setRecentBoutiques(data.slice(0, 4));
        }
      } catch (err) {
        console.error("Error fetching recent boutiques:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecentBoutiques();
  }, [apiBase]);

  function formatRelativeTime(dateString: string) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
      return "Just now";
    }
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours} hr ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) {
      return "Yesterday";
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  return (
    <section id="how" className="py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero opacity-60 -z-10" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-bold text-accent uppercase tracking-wider mb-3">Dashboard</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Our <span className="text-gradient-purple">Growing Community</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-16">
          {communityStats.map((s) => (
            <div
              key={s.label}
              className="glass-card rounded-2xl p-5 sm:p-6 hover:-translate-y-1 transition-transform shadow-card-luxe"
            >
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-2xl sm:text-3xl font-extrabold text-gradient-purple">{s.value}</p>
              <p className="mt-1.5 text-xs sm:text-sm font-medium text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white border border-border p-6 shadow-card-luxe">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" /> Recently Joined
            </h3>
            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : recentBoutiques.length > 0 ? (
                recentBoutiques.map((b) => {
                  const displayName = b.boutique_name || b.full_name || "Boutique Partner";
                  return (
                    <div
                      key={b.id}
                      className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-purple text-white font-bold text-sm">
                          {displayName[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{displayName}</p>
                          <p className="text-xs text-muted-foreground">{b.city || "India"}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatRelativeTime(b.created_at)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No boutiques joined recently.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-border p-6 shadow-card-luxe">
            <h3 className="font-bold text-lg">Top Contributors This Month</h3>
            <div className="mt-6 grid grid-cols-3 gap-2 items-end">
              {topContributors.map((c, i) => {
                const heights = ["h-24", "h-32", "h-20"];
                const bgs = [
                  "bg-gradient-to-t from-slate-300 to-slate-100",
                  "bg-gradient-gold",
                  "bg-gradient-to-t from-amber-700 to-amber-400",
                ];
                return (
                  <div key={c.name} className="flex flex-col items-center text-center">
                    <div className="text-2xl mb-1">{c.medal}</div>
                    <p className="text-[11px] font-bold truncate w-full">{c.name}</p>
                    <p className="text-xs text-primary font-bold mb-2">
                      ₹{c.amount.toLocaleString("en-IN")}
                    </p>
                    <div
                      className={`w-full rounded-t-lg ${heights[i]} ${bgs[i]} grid place-items-center text-white font-extrabold`}
                    >
                      {c.rank}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-border p-6 shadow-card-luxe">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
              </span>
              Live Activity
            </h3>
            <div className="mt-4 space-y-3 max-h-80 overflow-hidden">
              {activityFeed.map((a, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="mt-1 h-2 w-2 rounded-full bg-gradient-purple shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground/90">{a.text}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" /> {a.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
