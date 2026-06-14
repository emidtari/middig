import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Captcha, type CaptchaHandle } from "@/components/Captcha";
import { Mail, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Middig" },
      { name: "description", content: "Get in touch with the Middig team — submissions, press, partnerships." },
      { property: "og:title", content: "Contact — Middig" },
      { property: "og:description", content: "Get in touch with the Middig team." },
      { property: "og:url", content: "https://middig.lovable.app/contact" },
    ],
    links: [{ rel: "canonical", href: "https://middig.lovable.app/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const [info, setInfo] = useState<{ email: string | null; address: string | null; twitter: string | null; instagram: string | null } | null>(null);
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const captcha = useRef<CaptchaHandle>(null);

  useEffect(() => {
    supabase.from("contact_info" as never).select("email, address, twitter, instagram").eq("id", 1).maybeSingle().then(({ data }) => setInfo(data as never));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!captcha.current?.validate()) return;
    if (!name.trim() || !email.includes("@") || message.trim().length < 5) { toast.error("Please fill all fields."); return; }
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages" as never).insert({ name: name.trim(), email: email.trim(), message: message.trim() } as never);
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Message sent. Thank you!");
    setName(""); setEmail(""); setMessage(""); captcha.current?.reset();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto grid max-w-5xl gap-12 px-6 py-16 md:grid-cols-[1fr_1.2fr]">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Contact</h1>
          <p className="mt-4 text-muted-foreground">Questions, submissions, partnerships — we'd love to hear from you.</p>
          <div className="mt-8 space-y-3 text-sm">
            {info?.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> <a className="hover:underline" href={`mailto:${info.email}`}>{info.email}</a></p>}
            {info?.address && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {info.address}</p>}
            <div className="flex gap-4 text-muted-foreground">
              {info?.twitter && <a href={info.twitter} target="_blank" rel="noreferrer" className="hover:text-foreground">Twitter</a>}
              {info?.instagram && <a href={info.instagram} target="_blank" rel="noreferrer" className="hover:text-foreground">Instagram</a>}
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div>
            <label className="mb-1 block text-xs font-medium">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={200} className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} required maxLength={4000} rows={5} className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <Captcha ref={captcha} />
          <button disabled={submitting} className="w-full rounded bg-foreground px-4 py-2.5 text-sm text-background hover:opacity-90 disabled:opacity-50">
            {submitting ? "Sending…" : "Send message"}
          </button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
