import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { profile } = useAuth();
  return (
    <div className="space-y-8 p-6 md:p-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your profile and account security.</p>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-xl font-semibold">Profile Information</h2>
          <div className="space-y-2"><Label>Full name</Label><Input value={profile?.full_name ?? ""} disabled /></div>
          <div className="space-y-2"><Label>Mobile</Label><Input value={profile?.mobile ?? ""} disabled /></div>
          <div className="space-y-2"><Label>Account type</Label><Input value={profile?.user_type.replace("_", " ") ?? ""} disabled className="capitalize" /></div>
          {profile?.referral_code && (
            <div className="space-y-2"><Label>Referral code</Label><Input value={profile.referral_code} disabled className="font-mono" /></div>
          )}
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-xl font-semibold">Security & Privacy</h2>
          <div className="rounded-xl bg-muted/50 p-4 border border-border/50">
            <h3 className="font-bold text-sm">Session Security</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Your session is encrypted using industry-standard JWT tokens. This token is stored 
              locally on your device and is never shared via referral links.
            </p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4 border border-border/50">
            <h3 className="font-bold text-sm">Device Access</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              You are currently logged in from this browser. To ensure your account's safety on shared 
              devices, always use the <strong>Sign Out</strong> button before leaving.
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100">
            <h3 className="font-bold text-sm text-emerald-800">Referral Privacy</h3>
            <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
              Sharing your link only shares your public referral code. No other private 
              information (password, mobile, or token) is ever exposed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
