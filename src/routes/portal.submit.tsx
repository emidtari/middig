import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PortalLayout } from "@/components/PortalLayout";
import { RichTextEditor } from "@/components/RichTextEditor";
import { MultiSelect } from "@/components/MultiSelect";
import { slugify } from "@/lib/slug";

export const Route = createFileRoute("/portal/submit")({
  head: () => ({ meta: [{ title: "Submit a Site — Middig" }, { name: "robots", content: "noindex" }] }),
  component: PortalSubmit,
});

function PortalSubmit() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [studio, setStudio] = useState("");
  const [url, setUrl] = useState("");
  const [thumb, setThumb] = useState("");
  const [description, setDescription] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [catOpts, setCatOpts] = useState<{ id: string; name: string }[]>([]);
  const [tagOpts, setTagOpts] = useState<{ id: string; name: string }[]>([]);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: c }, { data: t }] = await Promise.all([
        supabase.from("categories" as never).select("id,name").order("name"),
        supabase.from("tags" as never).select("id,name").order("name"),
      ]);
      setCatOpts((c as never) ?? []);
      setTagOpts((t as never) ?? []);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.rpc("can_register_site" as never, { _user_id: user.id } as never);
        setAllowed(Boolean(data));
      }
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return toast.error("Title and URL are required.");
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return toast.error("Please sign in."); }

    const slug = slugify(title) + "-" + Math.random().toString(36).slice(2, 8);
    const { data: inserted, error } = await supabase.from("sites" as never).insert({
      owner_id: user.id, title: title.trim(), studio: studio.trim() || null, url: url.trim(),
      thumbnail_url: thumb.trim() || null, description_html: description || null,
      submitted_by_email: user.email, published: false, featured: false, status: "pending", slug,
    } as never).select("id").single();
    if (error || !inserted) { setBusy(false); return toast.error(error?.message ?? "Failed"); }
    const siteId = (inserted as { id: string }).id;

    if (cats.length) await supabase.from("site_categories" as never).insert(cats.map((c) => ({ site_id: siteId, category_id: c })) as never);
    if (tags.length) await supabase.from("site_tags" as never).insert(tags.map((t) => ({ site_id: siteId, tag_id: t })) as never);

    // Increment paid usage if applicable
    const { data: prof } = await supabase.from("profiles" as never).select("membership_tier,paid_until,paid_sites_used_this_period").eq("user_id", user.id).maybeSingle();
    const p = prof as { membership_tier?: string; paid_until?: string; paid_sites_used_this_period?: number } | null;
    const isPaidActive = p?.membership_tier === "paid" && p?.paid_until && new Date(p.paid_until) > new Date();
    const { count } = await supabase.from("sites" as never).select("id", { count: "exact", head: true }).eq("owner_id", user.id);
    if (isPaidActive && (count ?? 0) > 5) {
      await supabase.from("profiles" as never).update({ paid_sites_used_this_period: (p?.paid_sites_used_this_period ?? 0) + 1 } as never).eq("user_id", user.id);
    }

    setBusy(false);
    toast.success("Submitted for review!");
    navigate({ to: "/portal/sites" });
  }

  return (
    <PortalLayout title="Submit a Site">
      {allowed === false && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          You've reached your registration quota. <a href="/portal/billing" className="underline">Upgrade to paid</a> for +20/month.
        </div>
      )}
      <form onSubmit={submit} className="max-w-3xl space-y-5 rounded-xl border border-border bg-card p-6">
        <Field label="Site title *"><input required maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} className={input} /></Field>
        <Field label="Studio / designer"><input maxLength={200} value={studio} onChange={(e) => setStudio(e.target.value)} className={input} /></Field>
        <Field label="URL *"><input type="url" required value={url} onChange={(e) => setUrl(e.target.value)} className={input} placeholder="https://" /></Field>
        <Field label="Thumbnail URL"><input type="url" value={thumb} onChange={(e) => setThumb(e.target.value)} className={input} placeholder="https://" /></Field>
        <Field label="Categories"><MultiSelect options={catOpts} value={cats} onChange={setCats} placeholder="Select categories…" /></Field>
        <Field label="Tags"><MultiSelect options={tagOpts} value={tags} onChange={setTags} placeholder="Select tags…" /></Field>
        <Field label="Description">
          <RichTextEditor value={description} onChange={setDescription} />
        </Field>
        <button disabled={busy || allowed === false} className="w-full rounded bg-foreground px-4 py-2.5 text-sm text-background hover:opacity-90 disabled:opacity-50">
          {busy ? "Submitting…" : "Submit for review"}
        </button>
      </form>
    </PortalLayout>
  );
}

const input = "w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1.5 block text-xs font-medium">{label}</label>{children}</div>;
}
