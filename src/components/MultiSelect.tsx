import { X } from "lucide-react";

export function MultiSelect({ options, value, onChange, placeholder }: {
  options: { id: string; name: string }[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const selected = options.filter((o) => value.includes(o.id));
  const available = options.filter((o) => !value.includes(o.id));

  return (
    <div className="rounded border border-input bg-background p-2">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {selected.length === 0 && <span className="text-xs text-muted-foreground">{placeholder ?? "Select…"}</span>}
        {selected.map((o) => (
          <span key={o.id} className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs">
            {o.name}
            <button type="button" onClick={() => onChange(value.filter((id) => id !== o.id))} className="text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      {available.length > 0 && (
        <select
          value=""
          onChange={(e) => { if (e.target.value) onChange([...value, e.target.value]); }}
          className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none"
        >
          <option value="">+ Add…</option>
          {available.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      )}
    </div>
  );
}
