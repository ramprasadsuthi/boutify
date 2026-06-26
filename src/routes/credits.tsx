import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useAuth, type Profile } from "@/contexts/AuthContext";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  CheckCircle2,
  Loader2,
  Coins,
  ArrowUpRight,
  Search,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  const [selectedOwner, setSelectedOwner] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [ownerComboboxOpen, setOwnerComboboxOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [lastAmount, setLastAmount] = useState("");
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
      setUsers(data);
    } catch (err: any) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.user_type === "admin") load();
  }, [profile]);

  const customers = users.filter((u) => u.user_type === "customer");
  const owners = users.filter((u) => u.user_type === "boutique_owner");

  const handleAddCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !amount || isNaN(Number(amount))) return;

    try {
      setCrediting(true);
      setSuccessAnim(false);
      setDistributions([]);
      const currentAmount = amount;

      const res = await fetch(`${apiBase}/api/admin/credit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          customerId: selectedUser,
          amount: currentAmount,
          boutiqueOwnerId: selectedOwner || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add credit");

      setDistributions(data.distributions || []);
      setLastAmount(currentAmount);
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

  const targetCustomer = customers.find((u) => u.id === selectedUser);
  const targetOwner = owners.find((u) => u.id === selectedOwner);

  // Live Preview Calculation
  const parsedAmount = parseFloat(amount) || 0;
  const previewDistributions = useMemo(() => {
    if (!selectedUser || parsedAmount <= 0) return [];

    let currentId = selectedUser;
    const customerParents = [];
    let firstAdminId = null;

    // Safety break after 10 iterations
    for (let i = 0; i < 10; i++) {
      const u = users.find((x) => x.id === currentId);
      if (u && u.referred_by) {
        const parent = users.find((x) => x.id === u.referred_by);
        if (!parent) break;

        if (parent.user_type === "customer") {
          customerParents.push({ id: parent.id });
          if (customerParents.length === 3) break;
        } else if (parent.user_type === "admin") {
          if (!firstAdminId) firstAdminId = parent.id;
          break;
        }
        currentId = parent.id;
      } else {
        break;
      }
    }

    const dists = [];
    if (customerParents.length > 0) {
      if (customerParents.length === 3) {
        dists.push({
          id: customerParents[0].id,
          amount: parseFloat((parsedAmount * 0.6).toFixed(2)),
          level: 1,
        });
        dists.push({
          id: customerParents[1].id,
          amount: parseFloat((parsedAmount * 0.2).toFixed(2)),
          level: 2,
        });
        dists.push({
          id: customerParents[2].id,
          amount: parseFloat((parsedAmount * 0.2).toFixed(2)),
          level: 3,
        });
      } else if (customerParents.length === 2) {
        dists.push({
          id: customerParents[0].id,
          amount: parseFloat((parsedAmount * 0.8).toFixed(2)),
          level: 1,
        });
        dists.push({
          id: customerParents[1].id,
          amount: parseFloat((parsedAmount * 0.2).toFixed(2)),
          level: 2,
        });
      } else if (customerParents.length === 1) {
        dists.push({
          id: customerParents[0].id,
          amount: parseFloat(parsedAmount.toFixed(2)),
          level: 1,
        });
      }
    } else if (firstAdminId) {
      dists.push({ id: firstAdminId, amount: parseFloat(parsedAmount.toFixed(2)), level: 1 });
    }

    return dists.filter((d) => d.amount > 0);
  }, [selectedUser, amount, users]);

  return (
    <AppShell>
      <div className="space-y-8 p-6 md:p-10 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Credit Management</h1>
          <p className="mt-1 text-muted-foreground font-medium">
            Add credits to a customer's network automatically.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-border bg-card shadow-soft p-6 h-fit">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Coins className="text-emerald-500" />
              Issue New Credit
            </h2>

            <form onSubmit={handleAddCredit} className="space-y-6">
              <div className="space-y-2">
                <Label>Select Boutique Owner (Optional)</Label>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Popover open={ownerComboboxOpen} onOpenChange={setOwnerComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={ownerComboboxOpen}
                        className="w-full justify-between font-normal text-muted-foreground"
                      >
                        {selectedOwner
                          ? (() => {
                              const u = owners.find((user) => user.id === selectedOwner);
                              return u ? (
                                <span className="text-foreground">
                                  {u.full_name} ({u.boutique_name || u.userid})
                                </span>
                              ) : (
                                "Select owner..."
                              );
                            })()
                          : "Select owner..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search owner by name, boutique or user id..." />
                        <CommandList>
                          <CommandEmpty>No owner found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="none"
                              onSelect={() => {
                                setSelectedOwner("");
                                setOwnerComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedOwner === "" ? "opacity-100" : "opacity-0",
                                )}
                              />
                              None (Admin Direct)
                            </CommandItem>
                            {owners.map((u) => (
                              <CommandItem
                                key={u.id}
                                value={`${u.full_name} ${u.boutique_name || ""} ${u.userid || ""} ${u.id}`}
                                onSelect={() => {
                                  setSelectedOwner(u.id);
                                  setOwnerComboboxOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedOwner === u.id ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {u.full_name} ({u.boutique_name || u.userid})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
                {targetOwner && (
                  <p className="text-[10px] text-emerald-600 font-medium animate-in fade-in slide-in-from-top-1">
                    ₹{parsedAmount > 0 ? parsedAmount : "0"} will be accumulated in{" "}
                    <strong>{targetOwner.boutique_name || targetOwner.full_name}</strong>'s wallet.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Select Target Customer</Label>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
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
                              const u = customers.find((user) => user.id === selectedUser);
                              return u ? (
                                <span className="text-foreground">
                                  {u.full_name} ({u.userid || u.mobile})
                                </span>
                              ) : (
                                "Select customer..."
                              );
                            })()
                          : "Select customer..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search customer by name, user id or mobile..." />
                        <CommandList>
                          <CommandEmpty>No customer found.</CommandEmpty>
                          <CommandGroup>
                            {customers.map((u) => (
                              <CommandItem
                                key={u.id}
                                value={`${u.full_name} ${u.userid || ""} ${u.mobile} ${u.id}`}
                                onSelect={() => {
                                  setSelectedUser(u.id);
                                  setComboboxOpen(false);
                                  setSuccessAnim(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedUser === u.id ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {u.full_name} ({u.userid || u.mobile})
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
                  <span className="absolute left-3 top-2.5 text-muted-foreground font-medium">
                    ₹
                  </span>
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
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                  </>
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
                    <p className="text-sm">
                      This customer doesn't have an upper network. The credit will not be
                      distributed.
                    </p>
                  </div>
                ) : (
                  <>
                    <Coins className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>
                      Select a customer and enter an amount to see the live distribution preview.
                    </p>
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

            {successAnim && (
              <div className="text-center space-y-4 animate-in zoom-in-95 duration-500">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Distribution Complete!</h3>
                <div className="space-y-2 bg-emerald-50 p-4 rounded-xl border border-emerald-100 max-h-[200px] overflow-y-auto">
                  {distributions.map((d, i) => {
                    const u = users.find((x) => x.id === d.id);
                    return (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          Level {d.level}: {u?.full_name}
                        </span>
                        <span className="font-bold text-emerald-700">+₹{d.amount}</span>
                      </div>
                    );
                  })}
                  {targetOwner && (
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-emerald-200 mt-2">
                      <span className="text-muted-foreground font-medium">Boutique Wallet:</span>
                      <span className="font-bold text-blue-700">+₹{lastAmount}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!successAnim && !crediting && previewDistributions.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4" /> Live Preview
                </h3>

                <div className="space-y-4">
                  {previewDistributions.map((d, i) => {
                    const u = users.find((x) => x.id === d.id);
                    return (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border",
                              d.level === 1
                                ? "bg-emerald-100 border-emerald-200 text-emerald-700"
                                : d.level === 2
                                  ? "bg-blue-100 border-blue-200 text-blue-700"
                                  : "bg-purple-100 border-purple-200 text-purple-700",
                            )}
                          >
                            {d.level}
                          </div>
                          {i < previewDistributions.length - 1 && (
                            <div className="w-px h-6 bg-border" />
                          )}
                        </div>
                        <div className="flex-1 flex justify-between items-center p-3 rounded-xl border border-border bg-muted/30 group-hover:bg-muted/50 transition-colors">
                          <div className="text-sm">
                            <div className="font-bold text-foreground">{u?.full_name}</div>
                            <div className="text-[10px] text-muted-foreground">
                              Level {d.level} Ancestor
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-emerald-600">₹{d.amount}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {d.level === 1 && previewDistributions.length === 3
                                ? "60%"
                                : d.level === 1 && previewDistributions.length === 2
                                  ? "80%"
                                  : d.level === 1 && previewDistributions.length === 1
                                    ? "100%"
                                    : "20%"}{" "}
                              of total
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {targetOwner && (
                  <div className="mt-4 p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex justify-between items-center">
                    <div className="text-sm">
                      <div className="font-bold text-blue-900">
                        {targetOwner.boutique_name || targetOwner.full_name}
                      </div>
                      <div className="text-[10px] text-blue-700">
                        Contribution Wallet Accumulation
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-blue-600">₹{parsedAmount}</div>
                      <div className="text-[10px] text-blue-700">100% of contribution</div>
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-center text-muted-foreground font-medium px-4">
                  Credits are automatically split between upline ancestors based on depth.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
