import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LayoutDashboard, Image, Inbox, Search, Phone, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/sites", label: "Sites", icon: Image },
  { to: "/admin/messages", label: "Messages", icon: Inbox },
  { to: "/admin/seo", label: "SEO", icon: Search },
  { to: "/admin/contact", label: "Contact", icon: Phone },
] as const;

export function AdminLayout({ children, title }: { children: ReactNode; title: string }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate({ to: "/auth" }); return; }
      const { data: roles } = await supabase.from("user_roles" as never).select("role").eq("user_id", user.id);
      const isAdmin = ((roles as Array<{ role: string }> | null) ?? []).some((r) => r.role === "admin");
      if (!alive) return;
      if (!isAdmin) { toast.error("Admin access required."); navigate({ to: "/" }); return; }
      setEmail(user.email ?? null);
      setReady(true);
    })();
    return () => { alive = false; };
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (!ready) return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <SidebarContent pathname={pathname} email={email} onSignOut={signOut} />
      </aside>

      {/* Drawer (mobile) */}
      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-card">
            <SidebarContent pathname={pathname} email={email} onSignOut={signOut} onClose={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button className="md:hidden rounded-md border border-border p-2" onClick={() => setDrawer(true)} aria-label="Open menu">
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="text-base font-semibold">{title}</h1>
          </div>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">View site →</Link>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({ pathname, email, onSignOut, onClose }: { pathname: string; email: string | null; onSignOut: () => void; onClose?: () => void }) {
  return (
    <>
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <Link to="/" className="text-base font-semibold tracking-tight">Middig</Link>
        {onClose && <button onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></button>}
      </div>
      <nav className="flex-1 space-y-0.5 p-3 text-sm">
        {NAV.map((n) => {
          const active = pathname === n.to || (n.to !== "/admin" && pathname.startsWith(n.to));
          return (
            <Link key={n.to} to={n.to} onClick={onClose} className={`flex items-center gap-2.5 rounded-md px-3 py-2 ${active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"}`}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <div className="mb-2 truncate px-2 text-xs text-muted-foreground" title={email ?? ""}>{email}</div>
        <button onClick={onSignOut} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </>
  );
}
