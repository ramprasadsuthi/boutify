import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Network, Users, Sparkles, Shield, BarChart3, Share2, Check } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-soft">
            <Network className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">Bouti<span className="text-gradient-primary">fy</span></span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#about" className="hover:text-foreground transition-colors">About</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
          <Link to="/register">
            <Button size="sm" className="bg-gradient-primary text-primary-foreground shadow-soft hover:shadow-elegant">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-accent-orange" />
              Premium SaaS for modern boutiques
            </div>
            <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
              Build Your <span className="text-gradient-primary">Customer Network</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Launch a viral referral program in minutes. Visualize your customer genealogy in real time, reward growth, and turn every customer into your best marketer.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow">
                  Build Your Customer Network <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login"><Button size="lg" variant="outline">View Demo</Button></Link>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative mx-auto mt-20 max-w-5xl">
            <div className="glass rounded-3xl p-6 shadow-elegant">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { v: "12.4k", l: "Customers" },
                  { v: "48%", l: "Referral rate" },
                  { v: "9", l: "Avg. tree depth" },
                  { v: "230", l: "New / week" },
                ].map((s) => (
                  <div key={s.l} className="rounded-2xl bg-background/80 p-5 text-left shadow-soft">
                    <div className="text-3xl font-bold text-gradient-primary">{s.v}</div>
                    <div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-float rounded-2xl bg-gradient-primary p-5 text-primary-foreground shadow-soft" style={{ animationDelay: `${i * 0.4}s` }}>
                    <Users className="mb-2 h-5 w-5 opacity-90" />
                    <div className="text-sm font-semibold">Network Branch {i}</div>
                    <div className="text-xs opacity-80">{20 * i + 4} active referrals</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold">Everything you need to scale referrals</h2>
            <p className="mt-4 text-muted-foreground">Designed for boutique owners. Loved by customers.</p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { icon: Network, title: "Live Genealogy Tree", desc: "Interactive React Flow visualization with unlimited depth, zoom & pan." },
              { icon: Share2, title: "One-Click Referrals", desc: "Auto-generated codes, instant share links, frictionless onboarding." },
              { icon: BarChart3, title: "Powerful Analytics", desc: "Growth charts, leaderboards, and network-expansion insights." },
              { icon: Shield, title: "Role-Based Access", desc: "Separate dashboards for admins, boutique owners and customers." },
              { icon: Users, title: "Boutique Management", desc: "Boutique owners manage their customers without joining the chain." },
              { icon: Sparkles, title: "Premium UI", desc: "Modern, responsive, and demo-ready out of the box." },
            ].map((f) => (
              <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-elegant">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-gradient-soft py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold">How it works</h2>
            <p className="mt-4 text-muted-foreground">From signup to a thriving network in 4 steps.</p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-4">
            {[
              "Customer signs up & receives a unique code",
              "Shares referral link with friends",
              "Friends join → tree updates instantly",
              "Track growth on the live dashboard",
            ].map((step, i) => (
              <div key={i} className="rounded-2xl bg-background p-6 shadow-soft">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">{i + 1}</div>
                <p className="text-sm font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / CTA */}
      <section id="about" className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="overflow-hidden rounded-3xl bg-gradient-primary p-12 text-center text-primary-foreground shadow-elegant md:p-20">
            <h2 className="text-4xl font-bold md:text-5xl">Ready to grow your boutique?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg opacity-90">
              Join boutiques using Boutify to turn customers into a self-growing referral engine.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="shadow-elegant">
                  Start free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm opacity-90">
              {["No credit card", "Setup in 60 seconds", "Cancel anytime"].map((t) => (
                <span key={t} className="inline-flex items-center gap-2"><Check className="h-4 w-4" /> {t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} Boutify. Crafted for modern boutiques.</div>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <Link to="/login" className="hover:text-foreground">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
