import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/app/boutique")({
  component: BoutiquePage,
});

function BoutiquePage() {
  const { profile, refreshProfile, apiBase } = useAuth();
  const [name, setName] = useState(profile?.boutique_name ?? "");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiBase}/api/auth/profile`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ boutique_name: name }),
      });

      if (!res.ok) throw new Error("Failed to update boutique");

      toast.success("Boutique updated!");
      await refreshProfile();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 p-6 md:p-10">
      <div>
        <h1 className="text-3xl font-bold">Boutique Management</h1>
        <p className="mt-1 text-muted-foreground">Customize your boutique details.</p>
      </div>
      <div className="max-w-xl space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="space-y-2">
          <Label>Boutique Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter boutique name" />
        </div>
        <Button onClick={save} disabled={busy} className="bg-gradient-primary text-primary-foreground">
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
