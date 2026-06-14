import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Trash2, MailOpen, Mail } from "lucide-react";

type Msg = { id: string; name: string; email: string; message: string; read: boolean; created_at: string };

export const Route = createFileRoute("/admin/messages")({
  head: () => ({ meta: [{ title: "Messages — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminMessages,
});

function AdminMessages() {
  const [items, setItems] = useState<Msg[]>([]);
  async function load() {
    const { data } = await supabase.from("contact_messages" as never).select("*").order("created_at", { ascending: false });
    setItems((data as Msg[] | null) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function toggleRead(m: Msg) {
    const { error } = await supabase.from("contact_messages" as never).update({ read: !m.read } as never).eq("id", m.id);
    if (error) return toast.error(error.message);
    load();
  }
  async function remove(m: Msg) {
    if (!confirm("Delete this message?")) return;
    const { error } = await supabase.from("contact_messages" as never).delete().eq("id", m.id);
    if (error) return toast.error(error.message);
    load();
  }

  return (
    <AdminLayout title="Messages">
      <div className="space-y-3">
        {items.length === 0 && <p className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">No messages yet.</p>}
        {items.map((m) => (
          <article key={m.id} className={`rounded-xl border border-border bg-card p-5 ${m.read ? "opacity-70" : ""}`}>
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <h3 className="font-medium">{m.name} <span className="ml-2 text-xs text-muted-foreground">{m.email}</span></h3>
                <p className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggleRead(m)} className="rounded p-1.5 hover:bg-accent" title={m.read ? "Mark unread" : "Mark read"}>
                  {m.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                </button>
                <button onClick={() => remove(m)} className="rounded p-1.5 text-destructive hover:bg-accent"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm">{m.message}</p>
          </article>
        ))}
      </div>
    </AdminLayout>
  );
}
