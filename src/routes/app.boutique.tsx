import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BoutiqueGalleryManager } from "@/components/app/BoutiqueGalleryManager";
import { Store, Image as ImageIcon } from "lucide-react";

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
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiBase}/api/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    <div className="space-y-10 p-6 md:p-10 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Boutique Management</h1>
        <p className="mt-1 text-muted-foreground">Customize your boutique details and gallery.</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-3 items-start">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" /> Basic Information
            </h3>
            <div className="space-y-2">
              <Label>Boutique Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter boutique name"
              />
            </div>
            <Button
              onClick={save}
              disabled={busy}
              className="w-full bg-gradient-primary text-primary-foreground font-bold"
            >
              {busy ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Gallery & Catalog Management</h2>
          </div>
          <BoutiqueGalleryManager />
        </div>
      </div>
    </div>
  );
}
