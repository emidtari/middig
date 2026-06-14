import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Image, Inbox, FileEdit } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Middig" }, { name: "robots", content: "noindex" }] }),
  component: AdminOverview,
});

function AdminOverview() {
  const [stats, setStats] = useState({ total: 0, drafts: 0, messages: 0 });
  useEffect(() => {
    (async () => {
      const [{ count: total }, { count: drafts }, { count: messages }] = await Promise.all([
        supabase.from("sites" as never).select("*", { count: "exact", head: true }).eq("published", true),
        supabase.from("sites" as never).select("*", { count: "exact", head: true }).eq("published", false),
        supabase.from("contact_messages" as never).select("*", { count: "exact", head: true }).eq("read", false),
      ]);
      setStats({ total: total ?? 0, drafts: drafts ?? 0, messages: messages ?? 0 });
    })();
  }, []);

  return (
    <AdminLayout title="Overview">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Published sites" value={stats.total} icon={Image} />
        <Stat label="Drafts / submissions" value={stats.drafts} icon={FileEdit} />
        <Stat label="Unread messages" value={stats.messages} icon={Inbox} />
      </div>
      <p className="mt-8 text-sm text-muted-foreground">Welcome back. Use the sidebar to manage sites, messages, SEO, and contact info.</p>
    </AdminLayout>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Image }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
