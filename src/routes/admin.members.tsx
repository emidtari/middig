import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";

export const Route = createFileRoute("/admin/members")({
  head: () => ({ meta: [{ title: "Members — Admin" }, { name: "robots", content: "noindex" }] }),
  component: Members,
});

type Row = { user_id: string; full_name: string | null; membership_tier: string; paid_until: string | null; paid_sites_used_this_period: number; created_at: string };

function Members() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles" as never).select("*").order("created_at", { ascending: false });
      setRows((data as Row[] | null) ?? []);
    })();
  }, []);

  return (
    <AdminLayout title="Members">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Name</th><th className="p-3">Tier</th><th className="p-3">Paid until</th><th className="p-3">Sites (paid used)</th><th className="p-3">Joined</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.user_id} className="border-t border-border">
                <td className="p-3">{r.full_name ?? "—"}</td>
                <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${r.membership_tier === "paid" ? "bg-foreground text-background" : "bg-accent"}`}>{r.membership_tier}</span></td>
                <td className="p-3">{r.paid_until ? new Date(r.paid_until).toLocaleDateString() : "—"}</td>
                <td className="p-3">{r.paid_sites_used_this_period}</td>
                <td className="p-3">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No members yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
