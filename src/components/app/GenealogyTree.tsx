import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  MarkerType,
  NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAuth, type Profile } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";

type Customer = Pick<
  Profile,
  "id" | "full_name" | "referral_code" | "referred_by" | "status" | "created_at" | "mobile"
>;

function CustomerNode({
  data,
}: {
  data: {
    name: string;
    code: string | null;
    refs: number;
    status: string;
    date: string;
    root?: boolean;
    mobile?: string | null;
    depth: number;
    hasHiddenChildren: boolean;
    isExpanded: boolean;
    isAdmin?: boolean;
  };
}) {
  const statusColor =
    data.status === "active"
      ? "bg-emerald-500"
      : data.status === "pending"
        ? "bg-amber-500"
        : "bg-rose-500";

  const showFullDetails = data.isAdmin || data.depth < 2;

  return (
    <div
      className={`min-w-[220px] rounded-2xl border ${data.root ? "border-transparent bg-gradient-primary text-primary-foreground shadow-elegant" : "border-border bg-card shadow-soft"} p-5 relative transition-transform hover:scale-[1.02] cursor-pointer`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${data.root ? "bg-white/20" : "bg-gradient-primary text-primary-foreground"}`}
        >
          {data.name[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-bold">{data.name}</div>
          <div
            className={`truncate font-mono text-xs ${data.root ? "opacity-90" : "text-muted-foreground"}`}
          >
            Code: {data.code ?? "—"}
          </div>
        </div>
      </div>
      {showFullDetails && data.mobile && (
        <div
          className={`mt-3 text-sm font-semibold ${data.root ? "opacity-90" : "text-foreground"}`}
        >
          {data.mobile}
        </div>
      )}
      {!showFullDetails && (
        <div className="mt-3 text-[10px] font-semibold italic text-muted-foreground/50">
          Phone Hidden
        </div>
      )}
      {showFullDetails && (
        <div
          className={`mt-4 flex items-center justify-between text-xs ${data.root ? "opacity-90" : "text-muted-foreground"}`}
        >
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className={`h-2.5 w-2.5 rounded-full ${statusColor}`} />
            {data.status}
          </span>
          <span className="font-medium">{data.refs} direct referrals</span>
        </div>
      )}
      {showFullDetails && (
        <div
          className={`mt-2 flex items-center justify-between text-[10px] uppercase tracking-widest font-semibold ${data.root ? "opacity-75" : "text-muted-foreground"}`}
        >
          <span>Member since {new Date(data.date).toLocaleDateString()}</span>
        </div>
      )}

      {data.hasHiddenChildren && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-3 py-1 rounded-full shadow-md font-bold border-2 border-background whitespace-nowrap">
          CLICK TO EXPAND
        </div>
      )}
      {data.isExpanded && !data.root && data.depth > 0 && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-muted text-muted-foreground text-[10px] px-3 py-1 rounded-full shadow-sm font-bold border-2 border-background whitespace-nowrap">
          CLICK TO COLLAPSE
        </div>
      )}
    </div>
  );
}

const nodeTypes = { customer: CustomerNode };

export function GenealogyTree({ rootId }: { rootId?: string }) {
  const { apiBase, profile } = useAuth();
  const isAdmin = profile?.user_type === "admin";
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [rfInstance, setRfInstance] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/dashboard/stats`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        const customerProfiles = data.allUsers.filter((u: any) => u.user_type === "customer");
        setCustomers(customerProfiles);
      } catch (error) {
        console.error("Error fetching network:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [apiBase]);

  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(node.id)) {
        next.delete(node.id);
      } else {
        next.add(node.id);
      }
      return next;
    });
  }, []);

  const { nodes, edges } = useMemo(() => {
    if (!customers.length) return { nodes: [] as Node[], edges: [] as Edge[] };
    const byParent = new Map<string | null, Customer[]>();
    customers.forEach((c) => {
      const key = c.referred_by || null;
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)!.push(c);
    });
    const refCount = (id: string) => byParent.get(id)?.length ?? 0;

    const customerIds = new Set(customers.map((c) => c.id));
    let roots: Customer[] = rootId
      ? customers.filter((c) => c.id === rootId)
      : customers.filter((c) => !c.referred_by || !customerIds.has(c.referred_by));

    const searchMatches = new Set<string>();
    const searchAncestors = new Set<string>();

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      const matched = customers.filter(
        (c) =>
          c.full_name?.toLowerCase().includes(lower) ||
          c.referral_code?.toLowerCase().includes(lower) ||
          c.mobile?.includes(searchTerm),
      );

      matched.forEach((m) => {
        searchMatches.add(m.id);
        let curr = m.referred_by;
        while (curr) {
          searchAncestors.add(curr);
          const parent = customers.find((c) => c.id === curr);
          curr = parent?.referred_by;
        }
      });

      if (matched.length > 0) {
        // Keep the original roots but only the branches that lead to the match
        roots = roots.filter((r) => searchMatches.has(r.id) || searchAncestors.has(r.id));
      } else {
        roots = [];
      }
    }

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    function layout(node: Customer, depth: number, xOffset: number, isRoot: boolean): number {
      let actualChildren = byParent.get(node.id) ?? [];

      // If we are tracing a path down to a search match, hide unrelated sibling branches
      if (searchTerm && searchAncestors.has(node.id) && !searchMatches.has(node.id)) {
        actualChildren = actualChildren.filter(
          (ch) => searchMatches.has(ch.id) || searchAncestors.has(ch.id),
        );
      }

      // We auto-expand paths that lead to the search match, or level 1 nodes, or manually expanded nodes
      const isSearchPath = searchTerm ? searchAncestors.has(node.id) : false;
      const shouldExpand = isSearchPath || depth < 1 || expandedNodes.has(node.id);
      const children = shouldExpand ? actualChildren : [];

      let width = 0;
      const childPositions: number[] = [];

      if (children.length === 0) {
        width = 1.2;
      } else {
        let currentX = xOffset;
        for (const ch of children) {
          const w = layout(ch, depth + 1, currentX, false);
          childPositions.push(currentX + w / 2);
          currentX += w;
          width += w;
        }
      }

      const myX =
        children.length === 0
          ? xOffset + width / 2
          : (childPositions[0] + childPositions[childPositions.length - 1]) / 2;

      nodes.push({
        id: node.id,
        type: "customer",
        position: { x: myX * 280, y: depth * 220 },
        data: {
          name: node.full_name,
          code: node.referral_code,
          refs: refCount(node.id),
          status: node.status,
          date: node.created_at,
          root: isRoot,
          mobile: node.mobile,
          depth: depth,
          hasHiddenChildren: actualChildren.length > 0 && !shouldExpand,
          isExpanded: actualChildren.length > 0 && shouldExpand,
          isAdmin,
        },
      });

      for (const ch of children) {
        edges.push({
          id: `${node.id}-${ch.id}`,
          source: node.id,
          target: ch.id,
          type: "step",
          animated: true,
          style: { stroke: "oklch(0.6 0.2 295)", strokeWidth: 3 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "oklch(0.6 0.2 295)",
            width: 20,
            height: 20,
          },
        });
      }
      return width;
    }

    let x = 0;
    for (const r of roots) {
      const w = layout(r, 0, x, true);
      x += w + 1;
    }
    return { nodes, edges };
  }, [customers, rootId, searchTerm, expandedNodes]);

  if (loading)
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading network…
      </div>
    );

  return (
    <div className="relative h-full w-full flex flex-col">
      <div className="absolute top-4 left-4 z-10 w-[340px] flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, phone, or code..."
            className="pl-9 bg-background/90 backdrop-blur shadow-sm border-border/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          title="Reset View"
          onClick={() => {
            setSearchTerm("");
            setExpandedNodes(new Set());
            setTimeout(() => {
              if (rfInstance) {
                rfInstance.fitView({ duration: 800 });
              }
            }, 50);
          }}
          className="bg-background/90 backdrop-blur shadow-sm border-border/50 shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1">
        {nodes.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
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
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            onInit={setRfInstance}
            fitView
            proOptions={{ hideAttribution: true }}
            minZoom={0.1}
          >
            <Background gap={24} size={1.5} color="oklch(0.9 0.01 290)" />
            <Controls className="!bg-background/80 !backdrop-blur-md !border-border/50 !shadow-soft !rounded-xl" />
            <MiniMap
              pannable
              zoomable
              className="!bg-transparent !border-transparent"
              nodeColor={() => "oklch(0.6 0.2 295)"}
            />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}
