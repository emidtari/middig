import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PortalLayout } from "@/components/PortalLayout";
import { thumbFor, type Site } from "@/lib/sites-data";

export const Route = createFileRoute("/portal/sites")({
  head: () => ({ meta: [{ title: "My Sites — Middig" }, { name: "robots", content: "noindex" }] }),
  component: MySites,
});

type MySite = Site & { slug: string; status: string; rejection_reason?: string | null };

function MySites() {
  const [items, setItems] = useState<MySite[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("sites" as never).select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
    setItems((data as MySite[] | null) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm("Delete this site?")) return;
    const { error } = await supabase.from("sites" as never).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted."); load();
  }

  return (
    <PortalLayout title="My Sites">
      <div className="mb-4 flex justify-between">
        <p className="text-sm text-muted-foreground">Manage the sites you've registered.</p>
        <Link to="/portal/submit" className="rounded bg-foreground px-4 py-2 text-sm text-background hover:opacity-90">+ New site</Link>
      </div>
      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No sites yet. <Link to="/portal/submit" className="underline">Register your first</Link>.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Site</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={thumbFor(s)} alt="" className="h-10 w-14 rounded object-cover" />
                      <div>
                        <div className="font-medium">{s.title}</div>
                        {s.rejection_reason && <div className="text-xs text-red-600">Rejected: {s.rejection_reason}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${s.status === "approved" ? "bg-green-100 text-green-800" : s.status === "rejected" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {s.status === "approved" && s.slug && (
                        <Link to="/site/$slug" params={{ slug: s.slug }} className="rounded border border-border px-2 py-1 text-xs hover:bg-accent"><ExternalLink className="h-3 w-3" /></Link>
                      )}
                      <button onClick={() => del(s.id)} className="rounded border border-border px-2 py-1 text-xs text-red-600 hover:bg-red-50"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PortalLayout>
  );
}
