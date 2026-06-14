import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";

type C = { email: string | null; address: string | null; twitter: string | null; instagram: string | null };

export const Route = createFileRoute("/admin/contact")({
  head: () => ({ meta: [{ title: "Contact — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminContact,
});

function AdminContact() {
  const [c, setC] = useState<C | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("contact_info" as never).select("email, address, twitter, instagram").eq("id", 1).maybeSingle().then(({ data }) => setC((data as C | null) ?? { email: "", address: "", twitter: "", instagram: "" }));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!c) return;
    setSaving(true);
    const { error } = await supabase.from("contact_info" as never).update(c as never).eq("id", 1);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  }

  if (!c) return <AdminLayout title="Contact"><p className="text-sm text-muted-foreground">Loading…</p></AdminLayout>;

  return (
    <AdminLayout title="Contact info">
      <form onSubmit={save} className="grid max-w-2xl gap-4 rounded-xl border border-border bg-card p-6">
        <Field label="Email"><input type="email" value={c.email ?? ""} onChange={(e) => setC({ ...c, email: e.target.value })} className={inp} /></Field>
        <Field label="Address"><input value={c.address ?? ""} onChange={(e) => setC({ ...c, address: e.target.value })} className={inp} /></Field>
        <Field label="Twitter URL"><input value={c.twitter ?? ""} onChange={(e) => setC({ ...c, twitter: e.target.value })} className={inp} /></Field>
        <Field label="Instagram URL"><input value={c.instagram ?? ""} onChange={(e) => setC({ ...c, instagram: e.target.value })} className={inp} /></Field>
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
