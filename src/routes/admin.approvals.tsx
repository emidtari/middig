import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { thumbFor, type Site } from "@/lib/sites-data";

export const Route = createFileRoute("/admin/approvals")({
  head: () => ({ meta: [{ title: "Approvals — Admin" }, { name: "robots", content: "noindex" }] }),
  component: Approvals,
});

type S = Site & { status: string; slug: string; submitted_by_email: string | null };

function Approvals() {
  const [items, setItems] = useState<S[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("sites" as never).select("*").eq("status", "pending").order("created_at", { ascending: false });
    setItems((data as S[] | null) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function approve(id: string) {
    const { error } = await supabase.from("sites" as never).update({ status: "approved", published: true } as never).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Approved & published."); load();
  }
  async function reject(id: string) {
    const reason = prompt("Reason for rejection?") ?? "";
    const { error } = await supabase.from("sites" as never).update({ status: "rejected", published: false, rejection_reason: reason } as never).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Rejected."); load();
  }

  return (
    <AdminLayout title="Pending Approvals">
      <p className="mb-4 text-sm text-muted-foreground">{items.length} awaiting review.</p>
      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">No pending submissions.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((s) => (
            <div key={s.id} className="rounded-xl border border-border bg-card p-4">
              <img src={thumbFor(s)} alt="" className="h-40 w-full rounded object-cover" />
              <div className="mt-3">
                <div className="font-medium">{s.title}</div>
                <div className="text-xs text-muted-foreground">{s.studio} · {s.submitted_by_email}</div>
                {s.url && <a href={s.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">{s.url} <ExternalLink className="h-3 w-3" /></a>}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => approve(s.id)} className="inline-flex flex-1 items-center justify-center gap-1 rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:opacity-90"><Check className="h-4 w-4" /> Approve</button>
                <button onClick={() => reject(s.id)} className="inline-flex flex-1 items-center justify-center gap-1 rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:opacity-90"><X className="h-4 w-4" /> Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
