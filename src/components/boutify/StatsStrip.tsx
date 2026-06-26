import { CountUp } from "./CountUp";
import { stats } from "@/lib/data/boutify";

export function StatsStrip() {
  return (
    <section className="relative py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="group relative rounded-2xl bg-white border border-border p-6 shadow-card-luxe hover:shadow-luxe transition-all hover:-translate-y-1"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-purple-gold opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-3xl mb-3">{s.icon}</div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gradient-purple">
                <CountUp to={s.value} prefix={"prefix" in s ? s.prefix : ""} />
              </p>
              <p className="mt-2 text-xs sm:text-sm font-medium text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
