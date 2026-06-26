import { ArrowRight, Sparkles, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/boutify/hero-boutique.jpg";
import { Link } from "@tanstack/react-router";

export function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden pt-24 lg:pt-32 pb-16 lg:pb-24 bg-gradient-hero"
    >
      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-20 left-[10%] h-2 w-2 rounded-full bg-accent animate-sparkle" />
        <div
          className="absolute top-40 right-[15%] h-3 w-3 rounded-full bg-primary/40 animate-sparkle"
          style={{ animationDelay: "0.6s" }}
        />
        <div
          className="absolute bottom-32 left-[20%] h-2 w-2 rounded-full bg-accent animate-sparkle"
          style={{ animationDelay: "1.2s" }}
        />
        <div
          className="absolute top-1/3 left-[45%] h-1.5 w-1.5 rounded-full bg-secondary/50 animate-sparkle"
          style={{ animationDelay: "1.8s" }}
        />
        <div
          className="absolute bottom-20 right-[25%] h-2.5 w-2.5 rounded-full bg-accent animate-sparkle"
          style={{ animationDelay: "0.3s" }}
        />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-white/60 backdrop-blur px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              India's Premium Boutique Network
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.05] tracking-tight">
              Welcome to <span className="text-gradient-purple">Boutify</span>
              <span className="block mt-6 mb-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground/80 leading-relaxed sm:leading-loose">
                India's Largest{" "}
                <style>
                  {`
                    @keyframes text-shimmer {
                      0% { background-position: 0% 50%; }
                      100% { background-position: 200% 50%; }
                    }
                    .animate-text-shimmer {
                      animation: text-shimmer 3s linear infinite;
                      background-size: 200% auto;
                    }
                  `}
                </style>
                <span
                  className="inline-block transform -rotate-3 -translate-y-2 mx-1 font-[cursive] italic font-black tracking-wide z-10 relative animate-text-shimmer"
                  style={{
                    fontSize: "1.5em",
                    background:
                      "linear-gradient(90deg, #7B2FF7, #A855F7, #F4C542, #A855F7, #7B2FF7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0px 15px 10px rgba(0,0,0,0.25))",
                  }}
                >
                  Reseller Hub
                </span>{" "}
                <br className="hidden sm:block" />& Boutique Community
              </span>
            </h1>

            <p className="text-lg lg:text-xl font-semibold tracking-wide text-primary">
              Connect <span className="text-accent">•</span> Earn{" "}
              <span className="text-accent">•</span> Grow <span className="text-accent">•</span>{" "}
              Redeem
            </p>

            <p className="text-base lg:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Join thousands of members and customers across India. Build your network, earn
              rewards, grow your connections, and unlock endless opportunities.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-2">
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-gradient-purple text-primary-foreground font-semibold h-12 px-7 shadow-luxe hover:opacity-95 hover:scale-[1.02] transition-all"
                >
                  Join Boutify Today
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
              <a href="#boutiques">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-7 font-semibold border-2 border-primary/20 hover:border-primary hover:bg-primary/5 w-full sm:w-auto"
                >
                  <Compass className="mr-1.5 h-4 w-4" />
                  Explore Network
                </Button>
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-luxe ring-1 ring-primary/10">
              <img
                src={heroImg}
                alt="Luxury boutique showroom with designer mannequins"
                width={1280}
                height={1280}
                className="w-full h-auto object-cover aspect-[4/5] sm:aspect-[5/5]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
            </div>

            {/* Reseller Hub Tag */}
            <div
              className="absolute top-1/4 -left-6 sm:-left-12 z-20 animate-float-slow group cursor-pointer"
              style={{ animationDelay: "2.5s" }}
            >
              <div className="relative">
                {/* Hanging string */}
                <div className="absolute -top-12 left-1/2 w-0.5 h-12 bg-gradient-to-b from-primary/20 to-primary/60 origin-top transform -translate-x-1/2 group-hover:rotate-[5deg] transition-transform duration-500" />

                {/* Tag Body */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-gold p-1 shadow-card-luxe origin-top transform group-hover:rotate-[5deg] transition-transform duration-500">
                  <div className="relative flex flex-col items-center justify-center rounded-lg bg-white px-5 py-3 shadow-inner">
                    {/* Hole punch */}
                    <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-background shadow-inner" />

                    <Sparkles className="mb-1 h-5 w-5 text-accent" />
                    <p className="text-center font-bold leading-tight">
                      <span className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
                        Welcome to the
                      </span>
                      <br />
                      <span className="text-gradient-purple text-sm sm:text-base whitespace-nowrap">
                        Reseller Hub
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-4 sm:-left-8 z-10 animate-float-slow">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-gold blur-xl opacity-50" />
                <div className="relative grid h-32 w-32 sm:h-40 sm:w-40 place-items-center rounded-full bg-gradient-purple-gold p-1 shadow-luxe animate-pulse-ring">
                  <div className="grid h-full w-full place-items-center rounded-full bg-white text-center px-3">
                    <p className="text-[10px] sm:text-xs font-bold leading-tight text-primary">
                      One App.
                      <br />
                      <span className="text-gradient-purple text-sm sm:text-base">Endless</span>
                      <br />
                      Possibilities.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating chip */}
            <div
              className="absolute top-6 -right-2 sm:-right-6 glass-card rounded-2xl px-4 py-3 shadow-card-luxe animate-float-slow"
              style={{ animationDelay: "1.5s" }}
            >
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-gold">
                  <Sparkles className="h-4 w-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Credits contributed as on today
                  </p>
                  <p className="text-sm font-bold text-primary">₹18,550</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
