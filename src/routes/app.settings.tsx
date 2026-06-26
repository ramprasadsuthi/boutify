import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save } from "lucide-react";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { profile, apiBase, refreshProfile } = useAuth();
  const [userid, setUserID] = useState(profile?.userid ?? "");
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile) {
      setUserID(profile.userid ?? "");
      setFullName(profile.full_name ?? "");
    }
  }, [profile]);

  const handleSave = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${apiBase}/api/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          userid: userid.toLowerCase().replace(/\s/g, ""),
          full_name: fullName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      await refreshProfile();
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const hasChanges = userid !== (profile?.userid ?? "") || fullName !== (profile?.full_name ?? "");

  return (
    <div className="space-y-8 p-6 md:p-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="mt-1 text-muted-foreground">Manage your profile and account security.</p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={busy} className="bg-gradient-primary shadow-soft">
            <Save className="mr-2 h-4 w-4" /> {busy ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-xl font-semibold">Profile Information</h2>
          <div className="space-y-2">
            <Label htmlFor="fn">Full name</Label>
            <Input id="fn" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="un">User ID</Label>
            <Input
              id="un"
              value={userid}
              onChange={(e) => setUserID(e.target.value)}
              placeholder={profile?.userid ? "" : "Set your User ID (e.g. mahi123)"}
            />
            {!profile?.userid && (
              <p className="text-[10px] text-amber-600 font-medium">
                Please set your User ID to enable login with it.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Mobile</Label>
            <Input value={profile?.mobile ?? ""} disabled className="bg-muted/30" />
          </div>
          <div className="space-y-2">
            <Label>Account type</Label>
            <Input
              value={profile?.user_type.replace("_", " ") ?? ""}
              disabled
              className="capitalize bg-muted/30"
            />
          </div>
          {profile?.referral_code && (
            <div className="space-y-2">
              <Label>Referral code</Label>
              <Input value={profile.referral_code} disabled className="font-mono bg-muted/30" />
            </div>
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
              You are currently logged in from this browser. To ensure your account's safety on
              shared devices, always use the <strong>Sign Out</strong> button before leaving.
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100">
            <h3 className="font-bold text-sm text-emerald-800">Referral Privacy</h3>
            <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
              Sharing your link only shares your public referral code. No other private information
              (password, mobile, or token) is ever exposed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
