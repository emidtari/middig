import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ALL_FILTERS, thumbFor, type Site } from "@/lib/sites-data";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Middig" },
      { name: "description", content: "Browse curated websites by style, type, and subject. A growing index of exceptional web design." },
      { property: "og:title", content: "Gallery — Middig" },
      { property: "og:description", content: "Browse curated websites by style, type, and subject." },
      { property: "og:url", content: "https://middig.lovable.app/gallery" },
    ],
    links: [{ rel: "canonical", href: "https://middig.lovable.app/gallery" }],
  }),
  component: Gallery,
});

function Gallery() {
  const [sites, setSites] = useState<Site[]>([]);
  const [activeGroup, setActiveGroup] = useState<keyof typeof ALL_FILTERS | null>(null);
  const [active, setActive] = useState<{ group: keyof typeof ALL_FILTERS; value: string } | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("sites" as never).select("*").eq("published", true).order("created_at", { ascending: false });
      setSites((data as Site[] | null) ?? []);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!active) return sites;
    return sites.filter((s) =>
      active.group === "Style" ? s.styles.includes(active.value)
      : active.group === "Type" ? s.types.includes(active.value)
      : s.subjects.includes(active.value),
    );
  }, [active, sites]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-2 px-6 py-3 text-sm">
          {(Object.keys(ALL_FILTERS) as Array<keyof typeof ALL_FILTERS>).map((group) => (
            <div key={group} className="relative">
              <button
                onClick={() => setActiveGroup(activeGroup === group ? null : group)}
                className={`rounded-full border px-3 py-1.5 transition-colors ${activeGroup === group ? "border-foreground bg-foreground text-background" : "border-border hover:bg-accent"}`}
              >{group}</button>
              {activeGroup === group && (
                <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border border-border bg-popover p-2 shadow-lg">
                  <div className="max-h-80 overflow-y-auto">
                    {ALL_FILTERS[group].map((v) => (
                      <button key={v} onClick={() => { setActive(active?.group === group && active?.value === v ? null : { group, value: v }); setActiveGroup(null); }}
                        className={`block w-full rounded px-3 py-1.5 text-left text-sm hover:bg-accent ${active?.group === group && active?.value === v ? "bg-accent font-medium" : ""}`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {active && (
            <button onClick={() => setActive(null)} className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-primary-foreground">
              <span className="text-xs uppercase tracking-wide opacity-80">{active.group}:</span>
              <span>{active.value}</span><span className="ml-1 text-xs">✕</span>
            </button>
          )}
          <div className="ml-auto text-xs text-muted-foreground">{filtered.length} {filtered.length === 1 ? "site" : "sites"}</div>
        </div>
      </div>

      <main className="mx-auto max-w-[1400px] px-6 py-10">
        <h1 className="mb-8 text-3xl font-semibold tracking-tight md:text-4xl">Gallery</h1>
        {filtered.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No sites match this filter yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((site) => (
              <article key={site.id} className="group">
                <a href={site.url ?? "#"} target={site.url ? "_blank" : undefined} rel="noreferrer">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
                    <img src={thumbFor(site)} alt={`${site.title} website preview`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-4">
                    <h3 className="text-sm font-medium">{site.title}</h3>
                    {site.studio && <span className="text-xs text-muted-foreground">{site.studio}</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                    {[...site.styles, ...site.types].slice(0, 3).map((t) => <span key={t}>{t}</span>)}
                  </div>
                </a>
              </article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
