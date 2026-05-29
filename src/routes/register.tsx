import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Network } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>): { ref?: string } => {
    return {
      ref: search.ref as string | undefined,
    }
  },
  component: Register,
});

function Register() {
  const nav = useNavigate();
  const search = Route.useSearch();
  const { user, profile, loading, apiBase, signOut } = useAuth();
  const [tab, setTab] = useState<"customer" | "boutique_owner" | "admin">("customer");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState(search.ref ?? "");
  const [boutiqueName, setBoutiqueName] = useState("");
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (search.ref) {
      setReferral(search.ref);
      // Fetch referrer name to show "You're joining X's network"
      (async () => {
        try {
          const res = await fetch(`${apiBase}/api/dashboard/stats`);
          const data = await res.json();
          const refUser = data.allUsers.find((u: any) => u.referral_code === search.ref);
          if (refUser) setReferrerName(refUser.full_name);
        } catch (e) {
          console.error("Failed to fetch referrer info");
        }
      })();
    }
  }, [search.ref, apiBase]);

  // If user is already logged in, show a session notice instead of silent redirect
  if (!loading && user && profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-elegant text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Network className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Already Logged In</h1>
          <p className="mt-4 text-muted-foreground">
            You are currently signed in as <strong className="text-foreground">{profile.full_name}</strong>.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            To register a new account, you must sign out first.
          </p>
          <div className="mt-8 space-y-3">
            <Button 
              className="w-full bg-gradient-primary text-primary-foreground shadow-soft"
              onClick={() => nav({ to: "/app" })}
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-border/50"
              onClick={async () => {
                await signOut();
                window.location.reload();
              }}
            >
              Sign out and Register New
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const email = `${mobile.replace(/\D/g, "")}@boutify.app`;
    try {
      const res = await fetch(`${apiBase}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fullName, 
          email, 
          password, 
          mobile, 
          userType: tab, 
          referralCodeInput: referral, 
          boutiqueName 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      toast.success("Account created! Please sign in.");
      nav({ to: "/login" });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-soft">
            <Network className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Bouti<span className="text-gradient-primary">fy</span></span>
        </Link>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {referrerName ? (
              <span>You're joining <strong className="text-primary">{referrerName}</strong>'s network</span>
            ) : (
              "Start growing your network today"
            )}
          </p>

          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="boutique_owner">Owner</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            <TabsContent value={tab} className="mt-0" />
          </Tabs>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fn">Full name</Label>
              <Input id="fn" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            {tab === "boutique_owner" && (
              <div className="space-y-2">
                <Label htmlFor="bn">Boutique name</Label>
                <Input id="bn" required value={boutiqueName} onChange={(e) => setBoutiqueName(e.target.value)} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="mob">Mobile number</Label>
              <Input id="mob" type="tel" required placeholder="e.g. 1234567890" value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw">Password</Label>
              <Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {tab === "customer" && (
              <div className="space-y-2">
                <Label htmlFor="rf">Referral code <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="rf" value={referral} onChange={(e) => setReferral(e.target.value.toUpperCase())} placeholder="e.g. AB12CD34" />
              </div>
            )}
            <Button type="submit" disabled={busy} className="w-full bg-gradient-primary text-primary-foreground shadow-soft hover:shadow-elegant">
              {busy ? "Creating…" : "Create account"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
