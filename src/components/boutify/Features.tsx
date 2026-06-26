import { TrendingUp, Wallet, Users, Gift } from "lucide-react";

const items = [
  {
    Icon: TrendingUp,
    title: "Grow",
    desc: "Get more customers walking through your door every day.",
  },
  { Icon: Wallet, title: "Earn", desc: "Receive wallet rewards on every milestone and referral." },
  {
    Icon: Users,
    title: "Connect",
    desc: "Network with boutique owners across India in one place.",
  },
  { Icon: Gift, title: "Redeem", desc: "Exclusive rewards, cashback and partner offers." },
];

export function Features() {
  return (
    <section id="about" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-bold text-accent uppercase tracking-wider mb-3">Benefits</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Why Join <span className="text-gradient-purple">Boutify</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to run, grow and reward your boutique business.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map(({ Icon, title, desc }, i) => (
            <div
              key={title}
              className="group relative rounded-2xl bg-white border border-border p-7 shadow-card-luxe hover:shadow-luxe transition-all hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-purple-gold opacity-0 group-hover:opacity-10 blur-3xl transition-opacity" />
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-purple-gold shadow-luxe group-hover:scale-110 transition-transform">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-5 text-xl font-bold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
              <div className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more →
              </div>
              <div className="absolute top-4 right-4 text-xs font-mono text-muted-foreground/40">
                0{i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
