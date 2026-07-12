import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PortalLayout } from "@/components/PortalLayout";

export const Route = createFileRoute("/portal/billing")({
  head: () => ({ meta: [{ title: "Billing — Middig" }, { name: "robots", content: "noindex" }] }),
  component: Billing,
});

type Payment = { id: string; amount_cents: number; currency: string; status: string; provider: string; created_at: string };

function Billing() {
  const [tier, setTier] = useState<"free" | "paid">("free");
  const [paidUntil, setPaidUntil] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [busy, setBusy] = useState(false);
  const [method, setMethod] = useState<"paypal" | "card">("card");

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: prof }, { data: pays }] = await Promise.all([
      supabase.from("profiles" as never).select("membership_tier,paid_until").eq("user_id", user.id).maybeSingle(),
      supabase.from("payments" as never).select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    const p = prof as { membership_tier?: string; paid_until?: string } | null;
    setTier((p?.membership_tier as "free" | "paid") ?? "free");
    setPaidUntil(p?.paid_until ?? null);
    setPayments((pays as Payment[] | null) ?? []);
  }
  useEffect(() => { load(); }, []);

  // Demo activation. In production this would go through Stripe/PayPal checkout.
  async function upgrade() {
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error: payErr } = await supabase.from("payments" as never).insert({
      user_id: user.id, amount_cents: 300, currency: "USD", provider: method === "paypal" ? "paypal" : "card_demo",
      status: "succeeded", period_months: 1, external_id: `demo_${Date.now()}`,
    } as never);
    if (payErr) { setBusy(false); return toast.error(payErr.message); }
    const until = new Date(); until.setMonth(until.getMonth() + 1);
    const { error } = await supabase.from("profiles" as never).update({
      membership_tier: "paid", paid_until: until.toISOString(),
      paid_sites_used_this_period: 0, period_started_at: new Date().toISOString(),
    } as never).eq("user_id", user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Upgraded to Paid!");
    load();
  }

  const isPaidActive = tier === "paid" && paidUntil && new Date(paidUntil) > new Date();

  return (
    <PortalLayout title="Billing">
      <div className="max-w-3xl space-y-6">
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Current plan</h2>
              <div className="mt-2 text-2xl font-semibold">{isPaidActive ? "Paid" : "Free"}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {isPaidActive ? `Active until ${new Date(paidUntil!).toLocaleDateString()}. +20 sites this period.` : "Up to 5 sites total."}
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-muted-foreground" />
          </div>
        </section>

        {!isPaidActive && (
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-2 text-lg font-semibold">Upgrade to Paid — $3 / month</h2>
            <p className="mb-4 text-sm text-muted-foreground">Register up to 20 additional sites each month.</p>
            <div className="mb-4 flex gap-2">
              <button onClick={() => setMethod("card")} className={`flex-1 rounded-lg border p-3 text-sm ${method === "card" ? "border-foreground bg-accent" : "border-border"}`}>Credit/Debit Card</button>
              <button onClick={() => setMethod("paypal")} className={`flex-1 rounded-lg border p-3 text-sm ${method === "paypal" ? "border-foreground bg-accent" : "border-border"}`}>PayPal</button>
            </div>
            <button onClick={upgrade} disabled={busy} className="w-full rounded bg-foreground px-4 py-2.5 text-sm text-background hover:opacity-90 disabled:opacity-50">
              {busy ? "Processing…" : `Pay with ${method === "paypal" ? "PayPal" : "Card"}`}
            </button>
            <p className="mt-2 text-xs text-muted-foreground">Note: Payment processing is running in demo mode. Real Stripe/PayPal checkout will be wired once payments are enabled.</p>
          </section>
        )}

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Payment history</h2>
          {payments.length === 0 ? <p className="text-sm text-muted-foreground">No payments yet.</p> : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr><th className="py-2">Date</th><th>Amount</th><th>Method</th><th>Status</th></tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="py-2">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td>${(p.amount_cents / 100).toFixed(2)} {p.currency}</td>
                    <td>{p.provider}</td>
                    <td>{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </PortalLayout>
  );
}
