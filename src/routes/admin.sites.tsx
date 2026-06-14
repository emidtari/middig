import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { thumbFor, type Site } from "@/lib/sites-data";
import { Plus, Trash2, Star, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin/sites")({
  head: () => ({ meta: [{ title: "Sites — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminSites,
});

const empty = { title: "", studio: "", url: "", thumbnail_url: "", styles: "", types: "", subjects: "", published: true, featured: false };

function AdminSites() {
  const [sites, setSites] = useState<Site[]>([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Site | null>(null);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const { data } = await supabase.from("sites" as never).select("*").order("created_at", { ascending: false });
    setSites((data as Site[] | null) ?? []);
  }
  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setForm(empty); setShowForm(true); }
  function openEdit(s: Site) {
    setEditing(s);
    setForm({ title: s.title, studio: s.studio ?? "", url: s.url ?? "", thumbnail_url: s.thumbnail_url ?? "",
      styles: s.styles.join(", "), types: s.types.join(", "), subjects: s.subjects.join(", "),
      published: s.published, featured: s.featured });
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title.trim(), studio: form.studio.trim() || null, url: form.url.trim() || null,
      thumbnail_url: form.thumbnail_url.trim() || null,
      styles: form.styles.split(",").map((s) => s.trim()).filter(Boolean),
      types: form.types.split(",").map((s) => s.trim()).filter(Boolean),
      subjects: form.subjects.split(",").map((s) => s.trim()).filter(Boolean),
      published: form.published, featured: form.featured,
    };
    const { error } = editing
      ? await supabase.from("sites" as never).update(payload as never).eq("id", editing.id)
      : await supabase.from("sites" as never).insert(payload as never);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Updated" : "Created");
    setShowForm(false); load();
  }

  async function toggle(s: Site, field: "published" | "featured") {
    const { error } = await supabase.from("sites" as never).update({ [field]: !s[field] } as never).eq("id", s.id);
    if (error) return toast.error(error.message);
    load();
  }

  async function remove(s: Site) {
    if (!confirm(`Delete "${s.title}"?`)) return;
    const { error } = await supabase.from("sites" as never).delete().eq("id", s.id);
    if (error) return toast.error(error.message);
    load();
  }

  const filtered = sites.filter((s) => s.title.toLowerCase().includes(q.toLowerCase()) || (s.studio ?? "").toLowerCase().includes(q.toLowerCase()));

  return (
    <AdminLayout title="Sites">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="rounded border border-input bg-background px-3 py-2 text-sm" />
        <button onClick={openNew} className="ml-auto inline-flex items-center gap-1.5 rounded bg-foreground px-3 py-2 text-sm text-background hover:opacity-90">
          <Plus className="h-4 w-4" /> New site
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3 text-left">Site</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={thumbFor(s)} alt="" className="h-10 w-14 rounded object-cover" />
                    <div>
                      <button onClick={() => openEdit(s)} className="font-medium hover:underline">{s.title}</button>
                      <div className="text-xs text-muted-foreground">{s.studio}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className={`rounded-full px-2 py-0.5 ${s.published ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{s.published ? "Published" : "Draft"}</span>
                    {s.featured && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">Featured</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <button onClick={() => toggle(s, "published")} className="rounded p-1.5 hover:bg-accent" title="Toggle published">{s.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    <button onClick={() => toggle(s, "featured")} className="rounded p-1.5 hover:bg-accent" title="Toggle featured"><Star className={`h-4 w-4 ${s.featured ? "fill-current" : ""}`} /></button>
                    <button onClick={() => remove(s)} className="rounded p-1.5 hover:bg-accent text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">No sites yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={save} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">{editing ? "Edit site" : "New site"}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title *"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inp} /></Field>
              <Field label="Studio"><input value={form.studio} onChange={(e) => setForm({ ...form, studio: e.target.value })} className={inp} /></Field>
              <Field label="URL"><input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className={inp} /></Field>
              <Field label="Thumbnail URL"><input type="url" value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} className={inp} /></Field>
              <Field label="Styles (comma separated)"><input value={form.styles} onChange={(e) => setForm({ ...form, styles: e.target.value })} className={inp} /></Field>
              <Field label="Types"><input value={form.types} onChange={(e) => setForm({ ...form, types: e.target.value })} className={inp} /></Field>
              <Field label="Subjects"><input value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} className={inp} /></Field>
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Published</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded border border-border px-4 py-2 text-sm">Cancel</button>
              <button type="submit" className="rounded bg-foreground px-4 py-2 text-sm text-background">Save</button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}

const inp = "w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-xs font-medium">{label}</label>{children}</div>;
}
