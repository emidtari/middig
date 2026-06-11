import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Middig — Web Design Inspiration" },
      { name: "description", content: "A curated showcase of the finest web design from around the world." },
      { property: "og:title", content: "Middig — Web Design Inspiration" },
      { property: "og:description", content: "Browse curated websites by style, type, and subject." },
    ],
  }),
  component: Index,
});

type Site = {
  id: number;
  title: string;
  studio: string;
  styles: string[];
  types: string[];
  subjects: string[];
  seed: string;
};

const SITES: Site[] = [
  { id: 1, title: "Atlas Studio", studio: "Field Office", styles: ["Minimal", "Typographic"], types: ["Portfolio"], subjects: ["Design"], seed: "atlas-studio-architecture" },
  { id: 2, title: "Norden Coffee", studio: "Brun & Co", styles: ["Editorial", "Light"], types: ["E-commerce"], subjects: ["Food & Drink"], seed: "norden-coffee-shop" },
  { id: 3, title: "Halcyon Magazine", studio: "Press Room", styles: ["Editorial", "Serif"], types: ["Publication"], subjects: ["Art"], seed: "halcyon-magazine-editorial" },
  { id: 4, title: "Form & Field", studio: "Solo", styles: ["Minimal"], types: ["Portfolio"], subjects: ["Photography"], seed: "form-field-photo" },
  { id: 5, title: "Pivot Labs", studio: "North Studio", styles: ["Bold", "Dark"], types: ["Agency"], subjects: ["Technology"], seed: "pivot-labs-tech" },
  { id: 6, title: "Maison Verde", studio: "Atelier B", styles: ["Editorial", "Light"], types: ["Brand"], subjects: ["Fashion"], seed: "maison-verde-fashion" },
  { id: 7, title: "Sable Hotel", studio: "Beacon", styles: ["Luxury", "Serif"], types: ["Hospitality"], subjects: ["Travel"], seed: "sable-hotel-luxury" },
  { id: 8, title: "Kindling Type", studio: "Foundry", styles: ["Typographic"], types: ["Foundry"], subjects: ["Typography"], seed: "kindling-type-foundry" },
  { id: 9, title: "Orbit Records", studio: "Wax & Wane", styles: ["Bold", "Colorful"], types: ["Brand"], subjects: ["Music"], seed: "orbit-records-music" },
  { id: 10, title: "Quiet Index", studio: "Index Office", styles: ["Minimal", "Monochrome"], types: ["Directory"], subjects: ["Design"], seed: "quiet-index-archive" },
  { id: 11, title: "Brae Restaurant", studio: "Salt", styles: ["Editorial"], types: ["Restaurant"], subjects: ["Food & Drink"], seed: "brae-restaurant-table" },
  { id: 12, title: "Northwind Studio", studio: "Self", styles: ["Minimal", "Light"], types: ["Portfolio"], subjects: ["Illustration"], seed: "northwind-illustration" },
  { id: 13, title: "Field Notes Co", studio: "Press", styles: ["Editorial", "Serif"], types: ["E-commerce"], subjects: ["Stationery"], seed: "field-notes-paper" },
  { id: 14, title: "Cascade Outdoor", studio: "Ridge", styles: ["Bold"], types: ["E-commerce"], subjects: ["Travel"], seed: "cascade-outdoor-mountains" },
  { id: 15, title: "Pale Blue Dot", studio: "Cosmos", styles: ["Dark", "Minimal"], types: ["Editorial"], subjects: ["Science"], seed: "pale-blue-dot-space" },
  { id: 16, title: "Studio Anvil", studio: "Anvil", styles: ["Bold", "Typographic"], types: ["Agency"], subjects: ["Branding"], seed: "studio-anvil-brand" },
  { id: 17, title: "Linen & Lark", studio: "Lark", styles: ["Light", "Editorial"], types: ["E-commerce"], subjects: ["Home"], seed: "linen-lark-home" },
  { id: 18, title: "Course / Compass", studio: "Compass", styles: ["Minimal"], types: ["Education"], subjects: ["Learning"], seed: "course-compass-learning" },
];

const ALL_FILTERS = {
  Style: ["Minimal", "Editorial", "Bold", "Typographic", "Dark", "Light", "Luxury", "Monochrome", "Colorful", "Serif"],
  Type: ["Portfolio", "E-commerce", "Publication", "Agency", "Brand", "Hospitality", "Foundry", "Directory", "Restaurant", "Editorial", "Education"],
  Subject: ["Design", "Food & Drink", "Art", "Photography", "Technology", "Fashion", "Travel", "Typography", "Music", "Illustration", "Stationery", "Science", "Branding", "Home", "Learning"],
} as const;

function thumb(seed: string, w = 1200, h = 800) {
  return `https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=${w}&q=80&auto=format&fit=crop&sig=${encodeURIComponent(seed)}`;
}

// Use picsum for visually distinct, free thumbnails by seed.
function picsum(seed: string, w = 1200, h = 800) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

function Index() {
  const [activeGroup, setActiveGroup] = useState<keyof typeof ALL_FILTERS | null>(null);
  const [active, setActive] = useState<{ group: keyof typeof ALL_FILTERS; value: string } | null>(null);

  const filtered = useMemo(() => {
    if (!active) return SITES;
    return SITES.filter((s) => {
      if (active.group === "Style") return s.styles.includes(active.value);
      if (active.group === "Type") return s.types.includes(active.value);
      return s.subjects.includes(active.value);
    });
  }, [active]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="text-xl font-semibold tracking-tight">Middig</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">— web design inspiration</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#gallery" className="hover:text-foreground">Gallery</a>
            <a href="#submit" className="hover:text-foreground">Submit</a>
            <a href="#about" className="hover:text-foreground">About</a>
            <a href="#newsletter" className="rounded-full bg-foreground px-4 py-1.5 text-background hover:opacity-90">Subscribe</a>
          </nav>
        </div>

        <div className="border-t border-border">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-2 px-6 py-3 text-sm">
            {(Object.keys(ALL_FILTERS) as Array<keyof typeof ALL_FILTERS>).map((group) => (
              <div key={group} className="relative">
                <button
                  onClick={() => setActiveGroup(activeGroup === group ? null : group)}
                  className={`rounded-full border px-3 py-1.5 transition-colors ${
                    activeGroup === group ? "border-foreground bg-foreground text-background" : "border-border hover:bg-accent"
                  }`}
                >
                  {group}
                </button>
                {activeGroup === group && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border border-border bg-popover p-2 shadow-lg">
                    <div className="max-h-80 overflow-y-auto">
                      {ALL_FILTERS[group].map((v) => (
                        <button
                          key={v}
                          onClick={() => {
                            setActive(active?.group === group && active?.value === v ? null : { group, value: v });
                            setActiveGroup(null);
                          }}
                          className={`block w-full rounded px-3 py-1.5 text-left text-sm hover:bg-accent ${
                            active?.group === group && active?.value === v ? "bg-accent font-medium" : ""
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {active && (
              <button
                onClick={() => setActive(null)}
                className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-primary-foreground"
              >
                <span className="text-xs uppercase tracking-wide opacity-80">{active.group}:</span>
                <span>{active.value}</span>
                <span className="ml-1 text-xs">✕</span>
              </button>
            )}

            <div className="ml-auto text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "site" : "sites"}
            </div>
          </div>
        </div>
      </header>

      <main id="gallery" className="mx-auto max-w-[1400px] px-6 py-10">
        <section className="mb-10">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
            A curated showcase of the finest web design.
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Middig collects exceptional work from studios and independents — sorted by style, type, and subject.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((site) => (
            <article key={site.id} className="group cursor-pointer">
              <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
                <img
                  src={picsum(site.seed, 1000, 750)}
                  alt={`${site.title} website preview`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-4">
                <h3 className="text-sm font-medium">{site.title}</h3>
                <span className="text-xs text-muted-foreground">{site.studio}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                {[...site.styles, ...site.types].slice(0, 3).map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-20 text-center text-muted-foreground">No sites match this filter yet.</p>
        )}
      </main>

      <footer id="about" className="mt-20 border-t border-border">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="text-lg font-semibold">Middig</div>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              An independent gallery of web design. Updated regularly with new work from studios and independents around the world.
            </p>
          </div>
          <div id="submit">
            <div className="text-sm font-medium">Submit</div>
            <p className="mt-2 text-sm text-muted-foreground">Have a site to share? Submissions are open.</p>
            <a href="#" className="mt-3 inline-block text-sm underline">Submit a site →</a>
          </div>
          <div id="newsletter">
            <div className="text-sm font-medium">Newsletter</div>
            <p className="mt-2 text-sm text-muted-foreground">A weekly digest of the best new additions.</p>
            <form className="mt-3 flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="you@studio.com"
                className="w-full rounded border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button className="rounded bg-foreground px-3 py-1.5 text-sm text-background">Join</button>
            </form>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Middig</span>
            <span>Made with care</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
