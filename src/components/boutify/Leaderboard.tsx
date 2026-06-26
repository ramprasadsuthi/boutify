import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "@tanstack/react-router";
import { Crown, Trophy, Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const tierStyles: Record<string, string> = {
  Gold: "bg-gradient-gold text-accent-foreground",
  Silver: "bg-gradient-to-br from-slate-300 to-slate-500 text-white",
  Bronze: "bg-gradient-to-br from-amber-600 to-amber-800 text-white",
};

const rankIcons = [Crown, Trophy, Award];

interface LeaderboardRow {
  rank: number;
  id: string;
  name: string;
  city: string;
  amount: number;
  tier: string;
  img: string;
}

export function Leaderboard() {
  const { apiBase } = useAuth();
  const [data, setData] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch(`${apiBase}/api/leaderboard`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [apiBase]);

  return (
    <section
      id="rewards"
      className="py-20 lg:py-28 bg-gradient-to-b from-white via-muted/50 to-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-bold text-accent uppercase tracking-wider mb-3">Leaderboard</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Top <span className="text-gradient-purple">Boutique Owners</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            The boutique partners leading India in growth, referrals, and rewards earned this
            season.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="rounded-2xl bg-white border border-border shadow-card-luxe overflow-hidden">
              <div className="bg-gradient-purple px-6 py-4">
                <h3 className="text-white font-bold text-lg">Ranking Table</h3>
              </div>
              <div className="divide-y divide-border">
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-5">Boutique</div>
                  <div className="col-span-3">City</div>
                  <div className="col-span-3 text-right">Contribution</div>
                </div>
                {loading ? (
                  <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : data.length > 0 ? (
                  data.map((row, i) => {
                    const Icon = i < 3 ? rankIcons[i] : null;
                    return (
                      <div
                        key={row.rank}
                        className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/40 transition-colors"
                      >
                        <div className="col-span-2 sm:col-span-1">
                          <div
                            className={`grid h-9 w-9 place-items-center rounded-lg font-bold text-sm ${
                              i === 0
                                ? "bg-gradient-gold text-accent-foreground"
                                : i === 1
                                  ? "bg-slate-200 text-slate-700"
                                  : i === 2
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-muted text-foreground"
                            }`}
                          >
                            {Icon ? <Icon className="h-4 w-4" /> : row.rank}
                          </div>
                        </div>
                        <div className="col-span-10 sm:col-span-5">
                          <Link to="/boutique/$id" params={{ id: row.id }}>
                            <p className="font-semibold text-foreground hover:text-primary transition-colors hover:underline cursor-pointer">
                              {row.name}
                            </p>
                          </Link>
                          <p className="text-xs text-muted-foreground sm:hidden">{row.city}</p>
                        </div>
                        <div className="hidden sm:block col-span-3 text-sm text-muted-foreground">
                          {row.city}
                        </div>
                        <div className="col-span-12 sm:col-span-3 text-right">
                          <span className="font-bold text-primary">
                            ₹{row.amount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    No rankings available yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {!loading &&
              data.slice(0, 3).map((b) => (
                <div
                  key={b.name}
                  className="group rounded-2xl bg-white border border-border shadow-card-luxe overflow-hidden hover:shadow-luxe hover:-translate-y-0.5 transition-all"
                >
                  <div className="relative h-32 overflow-hidden bg-muted">
                    <img
                      src={b.img}
                      alt={b.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold ${tierStyles[b.tier] || tierStyles.Bronze}`}
                    >
                      {b.tier} Partner
                    </span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-foreground">{b.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{b.city}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Contribution
                        </p>
                        <p className="font-bold text-primary">
                          ₹{b.amount.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <Link to="/boutique/$id" params={{ id: b.id }}>
                        <Button size="sm" variant="outline" className="font-semibold">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            {!loading && data.length === 0 && (
              <div className="py-12 text-center text-muted-foreground bg-white border rounded-2xl">
                No featured partners.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
