import { useState } from "react";

export function AdSlot() {
  const [gone, setGone] = useState(false);
  if (gone) return null;
  return (
    <aside
      className="mt-8 flex items-start gap-3 rounded-lg border border-border bg-card px-3 py-3"
      aria-label="Advertisement"
    >
      <span className="pt-1 text-xs font-medium uppercase tracking-wide text-muted">Ad</span>
      <p className="min-w-0 flex-1 text-sm leading-relaxed text-muted">
        Harbor Library, a free class on reading a statement. Unaffiliated. Not medical, legal, or credit
        advice.
      </p>
      <button type="button" className="min-h-11 shrink-0 px-2 text-sm text-foreground" onClick={() => setGone(true)}>
        Hide
      </button>
    </aside>
  );
}
