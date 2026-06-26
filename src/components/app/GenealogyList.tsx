import { useEffect, useMemo, useState } from "react";
import { useAuth, type Profile } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  User,
  Users,
  Phone,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Customer = Pick<
  Profile,
  | "id"
  | "full_name"
  | "referral_code"
  | "referred_by"
  | "status"
  | "created_at"
  | "mobile"
  | "userid"
>;

interface MemberRowProps {
  customer: Customer;
  depth: number;
  byParent: Map<string | null, Customer[]>;
  searchTerm: string;
  searchMatches: Set<string>;
  searchAncestors: Set<string>;
  isAdmin: boolean;
  initiallyExpanded?: boolean;
}

function MemberRow({
  customer,
  depth,
  byParent,
  searchTerm,
  searchMatches,
  searchAncestors,
  isAdmin,
  initiallyExpanded = false,
}: MemberRowProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded || depth < 1);

  const children = useMemo(() => byParent.get(customer.id) ?? [], [byParent, customer.id]);

  // Filter children based on search
  const filteredChildren = useMemo(() => {
    if (!searchTerm) return children;
    return children.filter((ch) => searchMatches.has(ch.id) || searchAncestors.has(ch.id));
  }, [children, searchTerm, searchMatches, searchAncestors]);

  const hasChildren = children.length > 0;
  const isMatch = searchTerm && searchMatches.has(customer.id);
  const isAncestor = searchTerm && searchAncestors.has(customer.id);

  // Auto-expand if it's an ancestor of a search match
  useEffect(() => {
    if (searchTerm && isAncestor) {
      setIsExpanded(true);
    }
  }, [searchTerm, isAncestor]);

  const statusColors = {
    active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    inactive: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };

  const showPhone = isAdmin || depth <= 1;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const paddingLeft = isMobile ? depth * 12 + 12 : depth * 24 + 16;

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "group flex items-center gap-4 py-3 px-4 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border/50",
          isMatch && "bg-primary/5",
          depth === 0 && "bg-muted/30",
        )}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3 min-w-0 flex-1 md:flex-none md:w-64 shrink-0">
          {hasChildren ? (
            <div className="w-5 h-5 mt-1.5 flex items-center justify-center text-muted-foreground group-hover:text-foreground">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          ) : (
            <div className="w-5" />
          )}

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  depth === 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {customer.full_name?.[0]?.toUpperCase() ?? "?"}
              </div>

              <div className="flex flex-col min-w-0">
                <span className={cn("text-sm font-semibold truncate", isMatch && "text-primary")}>
                  {customer.full_name}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-tight">
                  {customer.referral_code ?? "No Code"}
                </span>
              </div>
            </div>

            {/* Mobile Only Details */}
            <div className="mt-2 flex md:hidden flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground border-t border-border/30 pt-2">
              <div className="flex items-center gap-1 font-mono bg-muted px-1 rounded">
                <span>ID:</span>
                <span className="text-foreground">{customer.userid ?? "—"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-2.5 w-2.5" />
                <span>
                  {showPhone && customer.mobile ? customer.mobile : showPhone ? "—" : "Hidden"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-2.5 w-2.5" />
                <span>{new Date(customer.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-2.5 w-2.5" />
                <span>{children.length} Referrals</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block w-32 shrink-0">
          <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground truncate block">
            {customer.userid ?? "—"}
          </span>
        </div>

        <div className="hidden md:flex flex-1 items-center gap-8 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 w-32 shrink-0">
            {showPhone && customer.mobile ? (
              <>
                <Phone className="h-3.5 w-3.5" />
                <span>{customer.mobile}</span>
              </>
            ) : showPhone ? (
              <span className="text-muted-foreground/50">—</span>
            ) : (
              <span className="text-muted-foreground/30 italic">Hidden</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 w-24 shrink-0">
            <Users className="h-3.5 w-3.5" />
            <span>{children.length} Referrals</span>
          </div>
          <div className="flex items-center gap-1.5 w-32 shrink-0">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(customer.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center justify-end w-24 shrink-0">
          <Badge
            variant="outline"
            className={cn(
              "capitalize px-2 py-0 h-5 text-[10px]",
              statusColors[customer.status as keyof typeof statusColors] || "",
            )}
          >
            {customer.status}
          </Badge>
        </div>
      </div>

      {isExpanded && filteredChildren.length > 0 && (
        <div className="flex flex-col">
          {filteredChildren.map((child) => (
            <MemberRow
              key={child.id}
              customer={child}
              depth={depth + 1}
              byParent={byParent}
              searchTerm={searchTerm}
              searchMatches={searchMatches}
              searchAncestors={searchAncestors}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function GenealogyList({ rootId }: { rootId?: string }) {
  const { apiBase, profile } = useAuth();
  const isAdmin = profile?.user_type === "admin";
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/dashboard/stats`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        const customerProfiles = data.allUsers.filter((u: Profile) => u.user_type === "customer");
        setCustomers(customerProfiles);
      } catch (error) {
        console.error("Error fetching network:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [apiBase]);

  const { roots, byParent, searchMatches, searchAncestors } = useMemo(() => {
    const byParent = new Map<string | null, Customer[]>();
    customers.forEach((c) => {
      const key = c.referred_by || null;
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)!.push(c);
    });

    const customerIds = new Set(customers.map((c) => c.id));
    let rootCustomers: Customer[] = rootId
      ? customers.filter((c) => c.id === rootId)
      : customers.filter((c) => !c.referred_by || !customerIds.has(c.referred_by));

    const matches = new Set<string>();
    const ancestors = new Set<string>();

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      const matched = customers.filter(
        (c) =>
          c.full_name?.toLowerCase().includes(lower) ||
          c.referral_code?.toLowerCase().includes(lower) ||
          c.mobile?.includes(searchTerm),
      );

      matched.forEach((m) => {
        matches.add(m.id);
        let curr = m.referred_by;
        while (curr) {
          ancestors.add(curr);
          const parent = customers.find((c) => c.id === curr);
          curr = parent?.referred_by;
        }
      });

      if (matched.length > 0) {
        rootCustomers = rootCustomers.filter((r) => matches.has(r.id) || ancestors.has(r.id));
      } else {
        rootCustomers = [];
      }
    }

    return { roots: rootCustomers, byParent, searchMatches: matches, searchAncestors: ancestors };
  }, [customers, rootId, searchTerm]);

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground italic">
        Loading network list...
      </div>
    );

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center gap-3 p-4 border-b bg-muted/20">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, phone, or code..."
            className="pl-9 h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => setSearchTerm("")} className="h-9 gap-2">
          <RefreshCw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        {roots.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <div className="text-lg font-medium text-foreground">
              {searchTerm ? "No matching members found" : "No referrals yet"}
            </div>
            <div className="text-sm">
              {searchTerm
                ? "Try a different search term."
                : "Share your referral code to start growing your network."}
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:min-w-[700px]">
            {/* Table Header for Desktop */}
            <div className="hidden md:flex items-center gap-4 py-2 px-4 bg-muted/30 border-b text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <div className="w-64 shrink-0">Member</div>
              <div className="w-32 shrink-0">User ID</div>
              <div className="flex-1 flex items-center gap-8">
                <div className="w-32 shrink-0">Mobile</div>
                <div className="w-24 shrink-0">Directs</div>
                <div className="w-32 shrink-0">Joined Date</div>
              </div>
              <div className="w-24 text-right shrink-0">Status</div>
            </div>

            {roots.map((root) => (
              <MemberRow
                key={root.id}
                customer={root}
                depth={0}
                byParent={byParent}
                searchTerm={searchTerm}
                searchMatches={searchMatches}
                searchAncestors={searchAncestors}
                isAdmin={isAdmin}
                initiallyExpanded={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
