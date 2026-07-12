import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { User, Image, CreditCard, PlusCircle, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/portal", label: "Profile", icon: User },
  { to: "/portal/sites", label: "My Sites", icon: Image },
  { to: "/portal/submit", label: "Submit Site", icon: PlusCircle },
  { to: "/portal/billing", label: "Billing", icon: CreditCard },
] as const;

export function PortalLayout({ children, title }: { children: ReactNode; title: string }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate({ to: "/auth", search: { redirect: "/portal" } as never }); return; }
      setEmail(user.email ?? null);
      setReady(true);
    })();
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  if (!ready) return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link to="/" className="text-base font-semibold tracking-tight">Middig</Link>
        </div>
        <nav className="flex-1 space-y-0.5 p-3 text-sm">
          {NAV.map((n) => {
            const active = pathname === n.to || (n.to !== "/portal" && pathname.startsWith(n.to));
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-2.5 rounded-md px-3 py-2 ${active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"}`}>
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <div className="mb-2 truncate px-2 text-xs text-muted-foreground">{email}</div>
          <button onClick={signOut} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:px-6">
          <h1 className="text-base font-semibold">{title}</h1>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">View site →</Link>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
        <nav className="grid grid-cols-4 border-t border-border md:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="flex flex-col items-center gap-1 py-2 text-[11px] text-muted-foreground">
              <n.icon className="h-4 w-4" /> {n.label.split(" ")[0]}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
