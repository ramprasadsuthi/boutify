import { announcements } from "@/lib/data/boutify";

export function Marquee() {
  const items = [...announcements, ...announcements];
  return (
    <section className="relative py-4 bg-gradient-purple overflow-hidden border-y border-accent/30">
      <div className="flex whitespace-nowrap animate-marquee">
        {items.map((a, i) => (
          <span
            key={i}
            className="mx-8 text-sm sm:text-base font-medium text-white/95 inline-flex items-center gap-2"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {a}
          </span>
        ))}
      </div>
    </section>
  );
}
