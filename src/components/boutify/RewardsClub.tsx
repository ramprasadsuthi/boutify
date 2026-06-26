import btfCoinImg from "@/assets/boutify/btf-coin.jpg";
import boutifyCardImg from "@/assets/boutify/boutify-rupay-card.png";
import { Sparkles, Coins, CreditCard, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RewardsClub() {
  return (
    <section
      id="rewards-club"
      className="py-20 lg:py-28 bg-gradient-to-b from-white via-slate-50/50 to-white relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-50/40 via-transparent to-transparent -z-10" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-bold text-accent uppercase tracking-wider mb-3">
            Partner Benefits
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Elite <span className="text-gradient-purple">Partner Privileges</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Exclusive loyalty assets unlocked automatically as your boutique contributes and expands
            in the Boutify ecosystem.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* BTF Coin Card */}
          <div className="group rounded-[2.5rem] bg-white border border-border/80 shadow-elegant p-6 sm:p-8 hover:shadow-elegant-lg hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between">
            <div>
              <div className="relative aspect-square max-w-[280px] mx-auto mb-8 rounded-[2rem] overflow-hidden bg-slate-50 p-2 shadow-soft group-hover:scale-[1.03] transition-transform duration-500">
                <img
                  src={btfCoinImg}
                  alt="BTF Coin"
                  className="w-full h-full object-contain rounded-2xl filter drop-shadow-[0_10px_15px_rgba(147,51,234,0.15)]"
                />
              </div>
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider">
                  <Coins className="h-3.5 w-3.5" /> Loyalty Currency
                </div>
                <h3 className="text-2xl font-extrabold text-foreground">BTF Loyalty Coins</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Earn BTF Coins for every milestone, direct referral, and successful customer deal.
                  Redeem these gold-standard partner coins for premium sewing supplies, exclusive
                  textile discounts, cashbacks, and specialized marketing credits to scale your
                  boutique.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-border/60 flex items-center justify-between">
              <div className="text-xs text-muted-foreground font-semibold">
                Earned via: <span className="text-primary font-bold">Sales & Referrals</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="font-bold text-primary group/btn gap-1 hover:bg-primary/5"
              >
                Learn More{" "}
                <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
              </Button>
            </div>
          </div>

          {/* Platinum RuPay Card Card */}
          <div className="group rounded-[2.5rem] bg-white border border-border/80 shadow-elegant p-6 sm:p-8 hover:shadow-elegant-lg hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between">
            <div>
              <div className="relative aspect-[1.58/1] max-w-[380px] mx-auto mb-8 flex items-center justify-center rounded-2xl overflow-hidden group-hover:scale-[1.03] transition-transform duration-500">
                <img
                  src={boutifyCardImg}
                  alt="Boutify Platinum Rupay Credit Card"
                  className="w-full h-auto object-contain rounded-xl shadow-elegant filter drop-shadow-[0_15px_20px_rgba(220,38,38,0.2)]"
                />
              </div>
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 text-xs font-bold uppercase tracking-wider">
                  <CreditCard className="h-3.5 w-3.5" /> Elite Tier Benefit
                </div>
                <h3 className="text-2xl font-extrabold text-foreground">
                  Boutify Platinum Rupay Credit Card
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  The ultimate physical token of prestige. Granted to our top-tier Gold partners,
                  this co-branded RuPay Signature card offers zero processing fees, instant wallet
                  payouts, special cashbacks at raw material suppliers, and VIP credentials for
                  regional designer events.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-border/60 flex items-center justify-between">
              <div className="text-xs text-muted-foreground font-semibold">
                Unlocked at: <span className="text-red-600 font-bold">Gold Tier Status</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="font-bold text-red-600 group/btn gap-1 hover:bg-red-50"
              >
                Apply Now{" "}
                <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
