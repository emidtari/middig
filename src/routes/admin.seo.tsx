import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";

type S = { site_title: string; site_description: string; og_image: string | null; twitter_handle: string | null; hero_headline: string; hero_subhead: string; featured_site_id: string | null };

export const Route = createFileRoute("/admin/seo")({
  head: () => ({ meta: [{ title: "SEO — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminSEO,
});

function AdminSEO() {
  const [s, setS] = useState<S | null>(null);
  const [sites, setSites] = useState<Array<{ id: string; title: string }>>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: settings }, { data: list }] = await Promise.all([
        supabase.from("site_settings" as never).select("*").eq("id", 1).maybeSingle(),
        supabase.from("sites" as never).select("id, title").eq("published", true).order("title"),
      ]);
      setS(settings as never);
      setSites((list as Array<{ id: string; title: string }> | null) ?? []);
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!s) return;
    setSaving(true);
    const { error } = await supabase.from("site_settings" as never).update(s as never).eq("id", 1);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  }

  if (!s) return <AdminLayout title="SEO"><p className="text-sm text-muted-foreground">Loading…</p></AdminLayout>;

  return (
    <AdminLayout title="SEO & Hero">
      <form onSubmit={save} className="grid max-w-2xl gap-4 rounded-xl border border-border bg-card p-6">
        <Field label="Site title"><input value={s.site_title} onChange={(e) => setS({ ...s, site_title: e.target.value })} className={inp} /></Field>
        <Field label="Site description"><textarea value={s.site_description} onChange={(e) => setS({ ...s, site_description: e.target.value })} rows={3} className={inp} /></Field>
        <Field label="OG image URL"><input value={s.og_image ?? ""} onChange={(e) => setS({ ...s, og_image: e.target.value })} className={inp} placeholder="https://" /></Field>
        <Field label="Twitter handle"><input value={s.twitter_handle ?? ""} onChange={(e) => setS({ ...s, twitter_handle: e.target.value })} className={inp} placeholder="@middig" /></Field>
        <hr className="border-border" />
        <Field label="Hero headline"><input value={s.hero_headline} onChange={(e) => setS({ ...s, hero_headline: e.target.value })} className={inp} /></Field>
        <Field label="Hero sub-headline"><textarea value={s.hero_subhead} onChange={(e) => setS({ ...s, hero_subhead: e.target.value })} rows={3} className={inp} /></Field>
        <Field label="Featured site">
          <select value={s.featured_site_id ?? ""} onChange={(e) => setS({ ...s, featured_site_id: e.target.value || null })} className={inp}>
            <option value="">— Auto (latest) —</option>
            {sites.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
          </select>
        </Field>
        <div className="flex justify-end">
          <button disabled={saving} className="rounded bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button>
        </div>
      </form>
    </AdminLayout>
  );
}

const inp = "w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-xs font-medium">{label}</label>{children}</div>;
}
