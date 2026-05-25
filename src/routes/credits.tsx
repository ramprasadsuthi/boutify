import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useAuth, type Profile } from "@/contexts/AuthContext";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Coins, ArrowUpRight, Search, Check, ChevronsUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/credits")({
  component: CreditsPage,
});

function CreditsPage() {
  const { user, profile, loading: authLoading, apiBase } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedUser, setSelectedUser] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [crediting, setCrediting] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);
  const [distributions, setDistributions] = useState<any[]>([]);

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
      setUsers(data.filter((u: any) => u.user_type === "customer"));
    } catch (err: any) {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.user_type === "admin") load();
  }, [profile]);

  const handleAddCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !amount || isNaN(Number(amount))) return;
    
    try {
      setCrediting(true);
      setSuccessAnim(false);
      setDistributions([]);
      
      const res = await fetch(`${apiBase}/api/admin/credit`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ customerId: selectedUser, amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add credit");
      
      setDistributions(data.distributions || []);
      setSuccessAnim(true);
      toast.success("Credits automatically distributed!");
      setAmount("");
      
      setTimeout(() => {
        setSuccessAnim(false);
      }, 8000);
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCrediting(false);
    }
  };

  const targetCustomer = users.find(u => u.id === selectedUser);

  // Live Preview Calculation
  const parsedAmount = parseFloat(amount) || 0;
  const previewDistributions = useMemo(() => {
    if (!selectedUser || parsedAmount <= 0) return [];
    
    let currentId = selectedUser;
    let parents = [];
    
    for (let i = 0; i < 3; i++) {
      const u = users.find(x => x.id === currentId);
      if (u && u.referred_by) {
        parents.push({ id: u.referred_by });
        currentId = u.referred_by;
      } else {
        break;
      }
    }

    let dists = [];
    if (parents.length === 3) {
       dists.push({ id: parents[0].id, amount: parseFloat((parsedAmount * 0.6).toFixed(2)), level: 1 });
       dists.push({ id: parents[1].id, amount: parseFloat((parsedAmount * 0.2).toFixed(2)), level: 2 });
       dists.push({ id: parents[2].id, amount: parseFloat((parsedAmount * 0.2).toFixed(2)), level: 3 });
    } else if (parents.length === 2) {
       dists.push({ id: parents[0].id, amount: parseFloat((parsedAmount * 0.8).toFixed(2)), level: 1 });
       dists.push({ id: parents[1].id, amount: parseFloat((parsedAmount * 0.2).toFixed(2)), level: 2 });
    } else if (parents.length === 1) {
       dists.push({ id: parents[0].id, amount: parseFloat(parsedAmount.toFixed(2)), level: 1 });
    }
    
    return dists.filter(d => d.amount > 0);
  }, [selectedUser, amount, users]);

  return (
    <AppShell>
      <div className="space-y-8 p-6 md:p-10 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Credit Management</h1>
          <p className="mt-1 text-muted-foreground font-medium">Add credits to a customer's network automatically.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-border bg-card shadow-soft p-6 h-fit">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Coins className="text-emerald-500" />
              Issue New Credit
            </h2>
            
            <form onSubmit={handleAddCredit} className="space-y-6">
              <div className="space-y-2">
                <Label>Select Customer</Label>
                {loading ? <Skeleton className="h-10 w-full" /> : (
                  <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={comboboxOpen}
                        className="w-full justify-between font-normal text-muted-foreground"
                      >
                        {selectedUser
                          ? (() => {
                              const u = users.find((user) => user.id === selectedUser);
                              return u ? <span className="text-foreground">{u.full_name} ({u.mobile})</span> : "Select customer...";
                            })()
                          : "Select customer..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search customer by name or mobile..." />
                        <CommandList>
                          <CommandEmpty>No customer found.</CommandEmpty>
                          <CommandGroup>
                            {users.map((u) => (
                              <CommandItem
                                key={u.id}
                                value={`${u.full_name} ${u.mobile} ${u.id}`}
                                onSelect={() => {
                                  setSelectedUser(u.id);
                                  setComboboxOpen(false);
                                  setSuccessAnim(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedUser === u.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {u.full_name} ({u.mobile})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className="space-y-2">
                <Label>Credit Amount (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground font-medium">₹</span>
                  <Input 
                    type="number" 
                    min="1" 
                    step="0.01" 
                    className="pl-8" 
                    placeholder="e.g. 5" 
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setSuccessAnim(false);
                    }}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 transition-all"
                disabled={crediting || !selectedUser || !amount}
              >
                {crediting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  "Automatically Distribute"
                )}
              </Button>
            </form>
          </div>

          <div className="relative rounded-2xl border border-border bg-card shadow-soft p-6 flex flex-col justify-center min-h-[300px] overflow-hidden">
            {!successAnim && !crediting && previewDistributions.length === 0 && (
              <div className="text-center text-muted-foreground">
                {selectedUser && parsedAmount > 0 ? (
                  <div className="text-amber-600 p-4 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="font-semibold mb-1">No Upline Found</p>
                    <p className="text-sm">This customer doesn't have an upper network. The credit will not be distributed.</p>
                  </div>
                ) : (
                  <>
                    <Coins className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>Select a customer and enter an amount to see the live distribution preview.</p>
                  </>
                )}
              </div>
            )}
            
            {crediting && (
              <div className="text-center text-emerald-600 animate-pulse">
                <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin" />
                <p className="font-medium">Calculating network upline...</p>
              </div>
            )}
            
            {!successAnim && !crediting && previewDistributions.length > 0 && (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-6">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4 ring-8 ring-blue-50">
                    <Search className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-700">Live Preview</h3>
                  <p className="text-sm text-muted-foreground mt-1">Projected split for {targetCustomer?.full_name}'s upline.</p>
                </div>
                
                <div className="space-y-3">
                  {previewDistributions.map((d: any, idx) => {
                    const parentUser = users.find(u => u.id === d.id);
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-100 animate-in slide-in-from-bottom-4 fade-in" style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                            L{d.level}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-blue-900">{parentUser?.full_name || "Unknown User"}</p>
                            <p className="text-xs text-blue-600">{parentUser?.mobile || "Unknown Mobile"}</p>
                          </div>
                        </div>
                        <div className="font-bold text-blue-700 flex items-center gap-1">
                          <ArrowUpRight className="h-4 w-4" />
                          +₹{d.amount}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {successAnim && (
              <div className="animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-6">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4 ring-8 ring-emerald-50">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-700">Credits Distributed!</h3>
                  <p className="text-sm text-muted-foreground mt-1">Successfully cascaded upwards from {targetCustomer?.full_name}.</p>
                </div>
                
                <div className="space-y-3">
                  {distributions.map((d: any, idx) => {
                    const parentUser = users.find(u => u.id === d.id);
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 animate-in slide-in-from-bottom-4 fade-in" style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                            L{d.level}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-emerald-900">{parentUser?.full_name || "Unknown User"}</p>
                            <p className="text-xs text-emerald-600">{parentUser?.mobile || "Unknown Mobile"}</p>
                          </div>
                        </div>
                        <div className="font-bold text-emerald-700 flex items-center gap-1">
                          <ArrowUpRight className="h-4 w-4" />
                          +₹{d.amount}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
