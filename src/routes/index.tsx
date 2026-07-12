import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ALL_FILTERS, thumbFor, type Site } from "@/lib/sites-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Middig — Curated Web Design Inspiration" },
      { name: "description", content: "Middig is a curated gallery of exceptional websites from studios and independents worldwide. Browse by style, type, and subject." },
      { property: "og:title", content: "Middig — Curated Web Design Inspiration" },
      { property: "og:description", content: "A curated gallery of exceptional web design." },
      { property: "og:url", content: "https://middig.lovable.app/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://middig.lovable.app/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Middig",
        url: "https://middig.lovable.app/",
        description: "A curated showcase of the finest web design.",
      }),
    }],
  }),
  component: Home,
});

function Home() {
  const [settings, setSettings] = useState<{ hero_headline: string; hero_subhead: string; featured_site_id: string | null } | null>(null);
  const [featured, setFeatured] = useState<Site | null>(null);
  const [recent, setRecent] = useState<Site[]>([]);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.from("site_settings" as never).select("hero_headline, hero_subhead, featured_site_id").eq("id", 1).maybeSingle();
      setSettings(s as never);

      const { data: sites } = await supabase
        .from("sites" as never)
        .select("*")
        .eq("published", true)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(7);
      const list = (sites as Site[] | null) ?? [];

      const fid = (s as never as { featured_site_id?: string } | null)?.featured_site_id ?? null;
      const f = fid ? list.find((x) => x.id === fid) ?? null : null;
      const featuredFinal = f ?? list.find((x) => x.featured) ?? list[0] ?? null;
      setFeatured(featuredFinal);
      setRecent(list.filter((x) => x.id !== featuredFinal?.id).slice(0, 6));
    })();
  }, []);

  const headline = settings?.hero_headline ?? "Web design inspiration, curated.";
  const subhead = settings?.hero_subhead ?? "Middig collects exceptional work from studios and independents around the world.";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* HERO */}
      <section className="border-b border-border" aria-label="Hero">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-14 md:grid-cols-2 md:py-20 lg:gap-16">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" /> Updated weekly
            </span>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">{headline}</h1>
            <p className="mt-4 max-w-lg text-base text-muted-foreground md:text-lg">{subhead}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/gallery" className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90">
                Browse the gallery <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/portal/submit" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent">
                Submit a site
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {ALL_FILTERS.Style.slice(0, 6).map((s) => (
                <Link key={s} to="/gallery" search={{ style: s } as never} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground">
                  {s}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative">
            {featured ? (
              <a href={featured.url ?? "#"} target={featured.url ? "_blank" : undefined} rel="noreferrer" className="group block">
                <div className="overflow-hidden rounded-xl border border-border bg-muted">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={thumbFor(featured)} alt={`${featured.title} website preview`} loading="eager" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-t border-border bg-card px-5 py-4">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Featured</div>
                      <div className="mt-0.5 text-base font-medium">{featured.title}</div>
                    </div>
                    {featured.studio && <span className="text-xs text-muted-foreground">{featured.studio}</span>}
                  </div>
                </div>
              </a>
            ) : (
              <div className="aspect-[4/3] rounded-xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground flex items-center justify-center text-center">
                Featured work will appear here once admins publish their first site.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* RECENT */}
      <main className="mx-auto max-w-[1400px] px-6 py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Recently added</h2>
            <p className="mt-1 text-sm text-muted-foreground">A glimpse of what's been catching our eye.</p>
          </div>
          <Link to="/gallery" className="text-sm text-muted-foreground hover:text-foreground">View all →</Link>
        </div>

        {recent.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            No published sites yet. Admins can add them from the dashboard.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((s) => (
              <article key={s.id} className="group">
                <a href={s.url ?? "#"} target={s.url ? "_blank" : undefined} rel="noreferrer">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
                    <img src={thumbFor(s)} alt={`${s.title} website preview`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-4">
                    <h3 className="text-sm font-medium">{s.title}</h3>
                    {s.studio && <span className="text-xs text-muted-foreground">{s.studio}</span>}
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
