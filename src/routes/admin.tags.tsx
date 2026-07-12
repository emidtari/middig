import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { slugify } from "@/lib/slug";

export const Route = createFileRoute("/admin/tags")({
  head: () => ({ meta: [{ title: "Tags — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminTags,
});

type Tag = { id: string; name: string; slug: string };

function AdminTags() {
  const [items, setItems] = useState<Tag[]>([]);
  const [name, setName] = useState("");

  async function load() {
    const { data } = await supabase.from("tags" as never).select("*").order("name");
    setItems((data as Tag[] | null) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!name.trim()) return;
    const { error } = await supabase.from("tags" as never).insert({ name: name.trim(), slug: slugify(name) } as never);
    if (error) return toast.error(error.message);
    setName(""); load();
  }
  async function del(id: string) {
    if (!confirm("Delete tag?")) return;
    const { error } = await supabase.from("tags" as never).delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  return (
    <AdminLayout title="Tags">
      <div className="max-w-3xl">
        <div className="mb-4 flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New tag name" className="flex-1 rounded border border-input bg-background px-3 py-2 text-sm" />
          <button onClick={add} className="inline-flex items-center gap-1 rounded bg-foreground px-4 py-2 text-sm text-background"><Plus className="h-4 w-4" /> Add</button>
        </div>
        <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-4">
          {items.length === 0 && <p className="text-sm text-muted-foreground">No tags yet.</p>}
          {items.map((t) => (
            <span key={t.id} className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-sm">
              #{t.name}
              <button onClick={() => del(t.id)} className="text-muted-foreground hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
