import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/app/AppShell";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownRight, ArrowUpRight, History } from "lucide-react";

export const Route = createFileRoute("/transactions")({
  component: TransactionsPage,
});

type Transaction = {
  id: number;
  user_id: string;
  amount: string;
  transaction_type: "credit" | "debit";
  description: string;
  created_at: string;
  full_name: string;
  mobile: string;
};

function TransactionsPage() {
  const { user, profile, loading: authLoading, apiBase } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || profile?.user_type !== "admin")) {
      navigate({ to: "/login" });
    }
  }, [user, profile, authLoading, navigate]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/admin/transactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTransactions(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.user_type === "admin") {
      load();
    }
  }, [profile]);

  return (
    <AppShell>
      <div className="space-y-6 p-6 md:p-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Credit History</h1>
          <p className="mt-1 text-muted-foreground font-medium">
            View all wallet transactions and network credit distributions.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/50">
              <Skeleton className="h-4 w-full" />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 border-b border-border last:border-0">
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(t.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{t.full_name}</div>
                      <div className="text-xs text-muted-foreground">{t.mobile}</div>
                    </td>
                    <td className="px-4 py-3 capitalize">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                          t.transaction_type === "credit"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {t.transaction_type === "credit" ? (
                          <ArrowDownRight className="mr-1 h-3 w-3" />
                        ) : (
                          <ArrowUpRight className="mr-1 h-3 w-3" />
                        )}
                        {t.transaction_type}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-muted-foreground max-w-xs truncate"
                      title={t.description}
                    >
                      {t.description}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      <span
                        className={
                          t.transaction_type === "credit" ? "text-emerald-600" : "text-rose-600"
                        }
                      >
                        {t.transaction_type === "credit" ? "+" : "-"}₹
                        {parseFloat(t.amount).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
                {!transactions.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <History className="h-8 w-8 opacity-20" />
                        <p>No transactions found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
