import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/submit", label: "Submit" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="text-xl font-semibold tracking-tight">Middig</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">— web design inspiration</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm md:flex" aria-label="Primary">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={`hover:text-foreground ${pathname === n.to ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {n.label}
            </Link>
          ))}
          <Link to="/auth" className="rounded-full bg-foreground px-4 py-1.5 text-background hover:opacity-90">Admin</Link>
        </nav>
        <button className="md:hidden rounded-md border border-border p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border md:hidden">
          <nav className="mx-auto flex max-w-[1400px] flex-col px-6 py-3 text-sm" aria-label="Mobile">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-2 text-muted-foreground hover:text-foreground">
                {n.label}
              </Link>
            ))}
            <Link to="/auth" onClick={() => setOpen(false)} className="py-2 font-medium">Admin →</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
