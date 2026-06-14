import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Captcha, type CaptchaHandle } from "@/components/Captcha";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit a site — Middig" },
      { name: "description", content: "Suggest a website to be featured in the Middig gallery. Submissions are reviewed by our editors." },
      { property: "og:title", content: "Submit a site — Middig" },
      { property: "og:description", content: "Suggest a website to be featured in Middig." },
      { property: "og:url", content: "https://middig.lovable.app/submit" },
    ],
    links: [{ rel: "canonical", href: "https://middig.lovable.app/submit" }],
  }),
  component: Submit,
});

function Submit() {
  const [title, setTitle] = useState(""); const [studio, setStudio] = useState("");
  const [url, setUrl] = useState(""); const [thumb, setThumb] = useState("");
  const [email, setEmail] = useState(""); const [submitting, setSubmitting] = useState(false);
  const captcha = useRef<CaptchaHandle>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!captcha.current?.validate()) return;
    if (!title.trim() || !url.trim()) { toast.error("Title and URL are required."); return; }
    setSubmitting(true);
    const { error } = await supabase.from("sites" as never).insert({
      title: title.trim(), studio: studio.trim() || null, url: url.trim(), thumbnail_url: thumb.trim() || null,
      submitted_by_email: email.trim() || null, published: false, featured: false,
    } as never);
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Submitted! We'll review it shortly.");
    setTitle(""); setStudio(""); setUrl(""); setThumb(""); setEmail(""); captcha.current?.reset();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Submit a site</h1>
        <p className="mt-3 text-muted-foreground">Tell us about a website worth sharing. Our editors review every submission.</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-xl border border-border bg-card p-6">
          <Field label="Site title *"><input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} className={input} /></Field>
          <Field label="Studio / designer"><input value={studio} onChange={(e) => setStudio(e.target.value)} maxLength={200} className={input} /></Field>
          <Field label="URL *"><input type="url" value={url} onChange={(e) => setUrl(e.target.value)} required className={input} placeholder="https://" /></Field>
          <Field label="Thumbnail URL (optional)"><input type="url" value={thumb} onChange={(e) => setThumb(e.target.value)} className={input} placeholder="https://" /></Field>
          <Field label="Your email (optional)"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} /></Field>
          <Captcha ref={captcha} />
          <button disabled={submitting} className="w-full rounded bg-foreground px-4 py-2.5 text-sm text-background hover:opacity-90 disabled:opacity-50">
            {submitting ? "Submitting…" : "Submit for review"}
          </button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}

const input = "w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-xs font-medium">{label}</label>{children}</div>;
}
