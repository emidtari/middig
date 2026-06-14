import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Middig" },
      { name: "description", content: "Middig is an independent gallery of web design, curated for studios, designers, and the eternally inspired." },
      { property: "og:title", content: "About — Middig" },
      { property: "og:description", content: "An independent gallery of web design." },
      { property: "og:url", content: "https://middig.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://middig.lovable.app/about" }],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">About Middig</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Middig is an independent gallery dedicated to celebrating thoughtful, well-crafted web design.
          We collect work from studios and independents around the world and organise it by style, type, and subject.
        </p>
        <h2 className="mt-12 text-2xl font-semibold">Our principles</h2>
        <ul className="mt-4 space-y-3 text-base text-muted-foreground">
          <li>— <strong className="text-foreground">Craft first.</strong> We look for typography, restraint, and intent.</li>
          <li>— <strong className="text-foreground">Open submissions.</strong> Anyone can submit; we curate before publishing.</li>
          <li>— <strong className="text-foreground">No noise.</strong> Clean layout, no ads, no dark patterns.</li>
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
