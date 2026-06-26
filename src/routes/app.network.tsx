import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { GenealogyTree } from "@/components/app/GenealogyTree";
import { GenealogyList } from "@/components/app/GenealogyList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, ListTree } from "lucide-react";

export const Route = createFileRoute("/app/network")({
  component: NetworkPage,
});

function NetworkPage() {
  const { profile } = useAuth();
  const isAdmin = profile?.user_type === "admin";
  return (
    <div className="flex h-screen flex-col p-6 md:p-10">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isAdmin ? "Customer Genealogy" : "My Network"}</h1>
          <p className="mt-1 text-muted-foreground">
            {isAdmin
              ? "Complete platform-wide referral tree."
              : "Your downline — interactive and live."}
          </p>
        </div>
      </div>

      <Tabs defaultValue="tree" className="flex flex-1 flex-col overflow-hidden">
        <div className="mb-4 flex items-center justify-between">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="tree" className="gap-2">
              <Network className="h-4 w-4" />
              Tree View
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <ListTree className="h-4 w-4" />
              List View
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <TabsContent value="tree" className="h-full m-0">
            <GenealogyTree rootId={isAdmin ? undefined : profile!.id} />
          </TabsContent>
          <TabsContent value="list" className="h-full m-0">
            <GenealogyList rootId={isAdmin ? undefined : profile!.id} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
