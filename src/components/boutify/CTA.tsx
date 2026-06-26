import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ctaWoman from "@/assets/boutify/cta-woman.jpg";
import { Link } from "@tanstack/react-router";

export function CTA() {
  return (
    <section id="blog" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-purple shadow-luxe">
          <div className="absolute inset-0 opacity-30" aria-hidden>
            <div className="absolute top-10 left-10 h-2 w-2 rounded-full bg-accent animate-sparkle" />
            <div
              className="absolute top-1/3 left-1/2 h-2 w-2 rounded-full bg-white animate-sparkle"
              style={{ animationDelay: "0.5s" }}
            />
            <div
              className="absolute bottom-10 left-1/4 h-3 w-3 rounded-full bg-accent animate-sparkle"
              style={{ animationDelay: "1s" }}
            />
            <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/40 blur-3xl" />
          </div>

          <div className="relative grid lg:grid-cols-2 items-center gap-8 p-8 sm:p-12 lg:p-16">
            <div className="text-white space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-1.5 text-xs font-semibold backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Free to Join
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
                Ready To Grow Your <span className="text-gradient-gold">Boutique?</span>
              </h2>
              <p className="text-white/85 text-lg max-w-md">
                Join thousands of boutique owners already earning with Boutify. Sign up in under 60
                seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://forms.gle/1H9ZgJbsTRNTn6Fm8"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="bg-gradient-gold text-accent-foreground font-bold h-12 px-7 shadow-gold-glow hover:opacity-95"
                  >
                    Contact us
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -inset-6 bg-gradient-gold opacity-25 blur-3xl rounded-full" />
              <div className="relative rounded-2xl overflow-hidden ring-4 ring-accent/40 shadow-luxe">
                <img
                  src={ctaWoman}
                  alt="Boutique owner in designer saree"
                  loading="lazy"
                  width={1024}
                  height={1280}
                  className="w-full h-auto object-cover aspect-[4/5]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
