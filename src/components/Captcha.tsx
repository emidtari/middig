import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { RefreshCw } from "lucide-react";

export type CaptchaHandle = { validate: () => boolean; reset: () => void };

function gen() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a + b };
}

export const Captcha = forwardRef<CaptchaHandle, { label?: string }>(function Captcha({ label = "Security check" }, ref) {
  const [q, setQ] = useState(gen);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setValue(""); setError(null); }, [q]);

  useImperativeHandle(ref, () => ({
    validate: () => {
      const ok = Number(value) === q.answer;
      if (!ok) setError("Wrong answer. Try the new question.");
      if (!ok) setQ(gen());
      return ok;
    },
    reset: () => setQ(gen()),
  }));

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <span className="rounded border border-border bg-muted px-3 py-2 text-sm font-mono select-none">{q.a} + {q.b} = ?</span>
        <input
          inputMode="numeric"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(null); }}
          className="w-24 rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Captcha answer"
        />
        <button type="button" onClick={() => setQ(gen())} className="rounded border border-border p-2 text-muted-foreground hover:bg-accent" aria-label="New question">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
});
