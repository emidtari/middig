import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { slugify } from "@/lib/slug";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "Categories — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminCategories,
});

type Cat = { id: string; name: string; slug: string; description: string | null };

function AdminCategories() {
  const [items, setItems] = useState<Cat[]>([]);
  const [name, setName] = useState("");

  async function load() {
    const { data } = await supabase.from("categories" as never).select("*").order("name");
    setItems((data as Cat[] | null) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!name.trim()) return;
    const { error } = await supabase.from("categories" as never).insert({ name: name.trim(), slug: slugify(name) } as never);
    if (error) return toast.error(error.message);
    setName(""); load();
  }
  async function del(id: string) {
    if (!confirm("Delete category?")) return;
    const { error } = await supabase.from("categories" as never).delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }
  async function rename(id: string, newName: string) {
    const { error } = await supabase.from("categories" as never).update({ name: newName, slug: slugify(newName) } as never).eq("id", id);
    if (error) toast.error(error.message);
  }

  return (
    <AdminLayout title="Categories">
      <div className="max-w-3xl">
        <div className="mb-4 flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name" className="flex-1 rounded border border-input bg-background px-3 py-2 text-sm" />
          <button onClick={add} className="inline-flex items-center gap-1 rounded bg-foreground px-4 py-2 text-sm text-background"><Plus className="h-4 w-4" /> Add</button>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Name</th><th className="p-3">Slug</th><th className="p-3 w-20"></th></tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="p-3">
                    <input defaultValue={c.name} onBlur={(e) => e.target.value !== c.name && rename(c.id, e.target.value)} className="w-full rounded bg-transparent px-2 py-1 hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                  </td>
                  <td className="p-3 text-muted-foreground">{c.slug}</td>
                  <td className="p-3"><button onClick={() => del(c.id)} className="text-red-600 hover:opacity-70"><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-sm text-muted-foreground">No categories yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
