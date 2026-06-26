import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/boutify/Navbar";
import { Hero } from "@/components/boutify/Hero";
import { StatsStrip } from "@/components/boutify/StatsStrip";
import { Marquee } from "@/components/boutify/Marquee";
import { SearchSection } from "@/components/boutify/SearchSection";
import { Leaderboard } from "@/components/boutify/Leaderboard";
import { RewardsClub } from "@/components/boutify/RewardsClub";
import { Community } from "@/components/boutify/Community";
import { Features } from "@/components/boutify/Features";
import { CTA } from "@/components/boutify/CTA";
import { Footer } from "@/components/boutify/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Boutify — India's Largest Boutique Community & Rewards Platform" },
      {
        name: "description",
        content:
          "Join 12,458+ boutique owners across 132 cities. Connect, earn rewards, grow your business, and redeem exclusive offers on Boutify.",
      },
      { property: "og:title", content: "Boutify — India's Largest Boutique Community" },
      {
        property: "og:description",
        content: "Connect • Earn • Grow • Redeem. India's premium boutique rewards platform.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <main>
        <Hero />
        <StatsStrip />
        <Marquee />
        <SearchSection />
        <Leaderboard />
        <RewardsClub />
        <Community />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
