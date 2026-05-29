import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth, type Profile } from "@/contexts/AuthContext";
import { AppShell } from "@/components/app/AppShell";
import { Trash2, LogOut, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/users")({
  component: UsersPage,
});

function UsersPage() {
  const { user, profile, loading: authLoading, signOut, apiBase } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "customer" | "boutique_owner" | "admin">("all");
  
  const [creditOpen, setCreditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [l1Amount, setL1Amount] = useState("");
  const [l2Amount, setL2Amount] = useState("");
  const [l3Amount, setL3Amount] = useState("");
  const [crediting, setCrediting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || profile?.user_type !== "admin")) {
      navigate({ to: "/login" });
    }
  }, [user, profile, authLoading, navigate]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/users`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.user_type === "admin") {
      load();
    }
  }, [profile]);

  const updateStatus = async (id: string, status: "active" | "restricted") => {
    try {
      const res = await fetch(`${apiBase}/api/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success(`User ${status}`);
      load();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`${apiBase}/api/users/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("User profile deleted successfully");
      load();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filtered = users.filter((u) => {
    if (filter !== "all" && u.user_type !== filter) return false;
    if (!q) return true;
    return (
      u.full_name?.toLowerCase().includes(q.toLowerCase()) ||
      u.mobile?.includes(q) ||
      u.email?.toLowerCase().includes(q.toLowerCase())
    );
  });

  const isInitialLoading = authLoading || (loading && users.length === 0);

  return (
    <AppShell>
      <div className="space-y-6 p-6 md:p-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin: User Management</h1>
            <p className="mt-1 text-muted-foreground font-medium">View and manage all users across the platform.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={load} variant="outline" size="sm" disabled={loading} className="hidden md:flex rounded-xl shadow-soft">
              {loading ? "Refreshing..." : "Refresh list"}
            </Button>
          </div>
        </div>

        {isInitialLoading ? (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/50">
                <Skeleton className="h-4 w-full" />
              </div>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="p-4 border-b border-border last:border-0">
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3">
              <Input 
                className="max-w-xs" 
                placeholder="Search name, email or mobile…" 
                value={q} 
                onChange={(e) => setQ(e.target.value)} 
              />
              {(["all", "admin", "boutique_owner", "customer"] as const).map((f) => (
                <Button 
                  key={f} 
                  variant={filter === f ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setFilter(f)} 
                  className={filter === f ? "bg-gradient-primary text-primary-foreground" : ""}
                >
                  {f.replace("_", " ")}
                </Button>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Mobile</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{u.full_name}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.mobile ?? "—"}</td>
                      <td className="px-4 py-3 capitalize">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                          u.user_type === "admin" ? "bg-purple-100 text-purple-700" :
                          u.user_type === "boutique_owner" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {u.user_type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.status === "active" ? "bg-emerald-100 text-emerald-700" :
                          u.status === "pending" ? "bg-amber-100 text-amber-700" :
                          "bg-rose-100 text-rose-700"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            u.status === "active" ? "bg-emerald-500" :
                            u.status === "pending" ? "bg-amber-500" :
                            "bg-rose-500"
                          }`} />
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {u.status === "active" ? (
                            <Button size="sm" variant="outline" onClick={() => updateStatus(u.id, "restricted")}>Restrict</Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => updateStatus(u.id, "active")}>Activate</Button>
                          )}
                          
                          {u.id !== user?.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete <strong>{u.full_name}</strong>'s profile from the database. 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteUser(u.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete User
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && !loading && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="h-8 w-8 opacity-20" />
                          <p>No users found matching your search.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
          </>
        )}
      </div>
    </AppShell>
  );
}
