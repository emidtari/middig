import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { thumbFor, type Site } from "@/lib/sites-data";

export const Route = createFileRoute("/site/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Middig` },
      { name: "description", content: `View details of ${params.slug} on Middig.` },
      { property: "og:title", content: `${params.slug} — Middig` },
    ],
  }),
  component: SiteDetail,
});

type Full = Site & {
  slug: string;
  description_html?: string | null;
  status: string;
  site_categories?: { categories: { id: string; name: string; slug: string } }[];
  site_tags?: { tags: { id: string; name: string; slug: string } }[];
};

function SiteDetail() {
  const { slug } = Route.useParams();
  const [site, setSite] = useState<Full | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("sites" as never)
        .select("*, site_categories(categories(id,name,slug)), site_tags(tags(id,name,slug))")
        .eq("slug", slug)
        .eq("status", "approved")
        .eq("published", true)
        .maybeSingle();
      if (!data) setNotFoundFlag(true);
      setSite(data as Full | null);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <PageWrap><p className="py-20 text-center text-muted-foreground">Loading…</p></PageWrap>;
  if (notFoundFlag || !site) return <PageWrap>
    <div className="py-20 text-center">
      <h1 className="text-2xl font-semibold">Site not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">This entry may be pending review or no longer available.</p>
      <Link to="/gallery" className="mt-6 inline-block text-sm underline">Back to gallery</Link>
    </div>
  </PageWrap>;

  const safeHtml = site.description_html ? DOMPurify.sanitize(site.description_html) : "";

  return (
    <PageWrap>
      <article className="mx-auto max-w-4xl px-6 py-12">
        <Link to="/gallery" className="text-xs text-muted-foreground hover:text-foreground">← Back to gallery</Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">{site.title}</h1>
        {site.studio && <p className="mt-2 text-muted-foreground">by {site.studio}</p>}

        <div className="mt-8 overflow-hidden rounded-xl border border-border bg-muted">
          <img src={thumbFor(site)} alt={`${site.title} website preview`} className="w-full object-cover" />
        </div>

        {site.url && (
          <a href={site.url} target="_blank" rel="noreferrer" className="mt-6 inline-block rounded-full bg-foreground px-5 py-2.5 text-sm text-background hover:opacity-90">
            Visit website →
          </a>
        )}

        {safeHtml && (
          <div className="prose prose-sm mt-10 max-w-none" dangerouslySetInnerHTML={{ __html: safeHtml }} />
        )}
        {!safeHtml && site.description && (
          <p className="mt-10 leading-relaxed text-foreground/90">{site.description}</p>
        )}

        <div className="mt-10 space-y-4 border-t border-border pt-6 text-sm">
          {site.site_categories && site.site_categories.length > 0 && (
            <div><span className="text-muted-foreground">Categories: </span>
              {site.site_categories.map((c) => <span key={c.categories.id} className="mr-2 rounded-full bg-accent px-2 py-0.5">{c.categories.name}</span>)}
            </div>
          )}
          {site.site_tags && site.site_tags.length > 0 && (
            <div><span className="text-muted-foreground">Tags: </span>
              {site.site_tags.map((t) => <span key={t.tags.id} className="mr-2 text-muted-foreground">#{t.tags.name}</span>)}
            </div>
          )}
        </div>
      </article>
    </PageWrap>
  );
}

function PageWrap({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background text-foreground"><SiteHeader />{children}<SiteFooter /></div>;
}
