import { Facebook, Instagram, Linkedin, Youtube, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoUrl from "@/assets/boutify/logo.png";

export function Footer() {
  return (
    <footer className="bg-foreground text-white pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-10">
          <div>
            <a href="#home" className="flex items-center gap-2 -my-4">
              <img src={logoUrl} alt="Boutify Logo" className="h-20 w-auto object-contain brightness-0 invert" />
            </a>
            <p className="mt-4 text-white/70 text-sm">Shop. Earn. Redeem.</p>
            <p className="mt-3 text-white/60 text-sm max-w-xs">
              India's largest boutique community & rewards platform.
            </p>
            <div className="flex gap-2 mt-5">
              {[Facebook, Instagram, Linkedin, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="social"
                  className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 hover:bg-gradient-purple-gold transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              {["Home", "Rewards", "Blog", "About Us"].map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-accent transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              {["Help Center", "Terms", "Privacy Policy", "Contact"].map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-accent transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Newsletter</h4>
            <p className="text-sm text-white/70 mb-3">Get product updates and offers.</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-10"
              />
              <Button
                size="icon"
                className="bg-gradient-gold text-accent-foreground shrink-0 h-10 w-10"
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <a
                href="#"
                className="rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs text-left transition-colors"
              >
                <span className="block text-white/60 text-[10px]">Get it on</span>
                <span className="font-semibold">Google Play</span>
              </a>
              <a
                href="#"
                className="rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs text-left transition-colors"
              >
                <span className="block text-white/60 text-[10px]">Download on</span>
                <span className="font-semibold">App Store</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>© 2026 Boutify. All Rights Reserved.</p>
          <p>Made with 💜 for India's boutique community.</p>
        </div>
      </div>
    </footer>
  );
}
