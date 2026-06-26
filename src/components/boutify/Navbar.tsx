import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import logoUrl from "@/assets/boutify/logo.png";

const links = [
  { label: "Home", href: "#home" },
  { label: "Rewards", href: "#rewards" },
  { label: "How It Works", href: "#how" },
  { label: "Blog", href: "#blog" },
  { label: "About Us", href: "#about" },
];

export function Navbar({ isDarkHeader = false }: { isDarkHeader?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-xl border-b border-border shadow-sm text-foreground"
          : isDarkHeader
          ? "bg-transparent text-white"
          : "bg-transparent text-foreground"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 lg:h-20 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logoUrl} alt="Boutify Logo" className="h-20 sm:h-[104px] w-auto object-contain -my-6 sm:-my-8" />
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  scrolled
                    ? "text-foreground/80 hover:text-primary hover:bg-muted"
                    : isDarkHeader
                    ? "text-white/80 hover:text-white hover:bg-white/10"
                    : "text-foreground/80 hover:text-primary hover:bg-muted"
                }`}
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <Link to="/login">
              <Button
                variant="ghost"
                className={`font-semibold ${
                  scrolled
                    ? ""
                    : isDarkHeader
                    ? "text-white hover:bg-white/10 hover:text-white"
                    : ""
                }`}
              >
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-gold text-accent-foreground font-semibold shadow-gold-glow hover:opacity-90 hover:shadow-lg transition-all">
                Register Now
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className={`lg:hidden grid h-10 w-10 place-items-center rounded-lg ${
              scrolled
                ? "hover:bg-muted text-foreground"
                : isDarkHeader
                ? "hover:bg-white/10 text-white"
                : "hover:bg-muted text-foreground"
            }`}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden border-t border-border py-4 space-y-1 bg-white/95 backdrop-blur-xl -mx-4 sm:-mx-6 px-4 sm:px-6">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block text-slate-800 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted"
              >
                {l.label}
              </a>
            ))}
            <div className="flex gap-2 pt-3">
              <Link to="/login" className="flex-1">
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link to="/register" className="flex-1">
                <Button className="w-full bg-gradient-gold text-accent-foreground font-semibold">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
