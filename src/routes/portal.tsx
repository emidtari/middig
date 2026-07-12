import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PortalLayout } from "@/components/PortalLayout";

export const Route = createFileRoute("/portal")({
  head: () => ({ meta: [{ title: "My Profile — Middig" }, { name: "robots", content: "noindex" }] }),
  component: PortalProfile,
});

function PortalProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ full_name: "", bio: "", avatar_url: "" });
  const [tier, setTier] = useState<"free" | "paid">("free");
  const [paidUntil, setPaidUntil] = useState<string | null>(null);
  const [pw, setPw] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles" as never).select("*").eq("user_id", user.id).maybeSingle();
      const p = data as { full_name?: string; bio?: string; avatar_url?: string; membership_tier?: string; paid_until?: string } | null;
      if (p) {
        setProfile({ full_name: p.full_name ?? "", bio: p.bio ?? "", avatar_url: p.avatar_url ?? "" });
        setTier((p.membership_tier as "free" | "paid") ?? "free");
        setPaidUntil(p.paid_until ?? null);
      }
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles" as never).update({ ...profile } as never).eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Profile saved.");
  }

  async function changePassword() {
    if (pw.length < 8) return toast.error("Password must be at least 8 characters.");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return toast.error(error.message);
    setPw(""); toast.success("Password updated.");
  }

  return (
    <PortalLayout title="Profile">
      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
        <div className="max-w-2xl space-y-8">
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Membership</h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs ${tier === "paid" ? "bg-foreground text-background" : "bg-accent"}`}>
                {tier === "paid" ? "Paid" : "Free"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {tier === "paid" && paidUntil ? `Active until ${new Date(paidUntil).toLocaleDateString()}.` : "Free tier — up to 5 sites total."}
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Edit profile</h2>
            <div className="space-y-3">
              <Field label="Full name"><input className={input} value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></Field>
              <Field label="Avatar URL"><input className={input} value={profile.avatar_url} onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })} /></Field>
              <Field label="Bio"><textarea className={input} rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></Field>
              <button onClick={save} disabled={saving} className="rounded bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-50">
                {saving ? "Saving…" : "Save profile"}
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Change password</h2>
            <div className="flex gap-2">
              <input type="password" className={input} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password (min 8)" />
              <button onClick={changePassword} className="rounded bg-foreground px-4 py-2 text-sm text-background hover:opacity-90">Update</button>
            </div>
          </section>
        </div>
      )}
    </PortalLayout>
  );
}

const input = "w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-xs font-medium">{label}</label>{children}</div>;
}
