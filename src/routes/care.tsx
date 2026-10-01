import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CrisisLine, LicenseNotice } from "@/components/notices";
import { TOPICS } from "@/lib/guides";
import { useGuides } from "@/lib/use-guides";
import { dollars } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/care")({ component: Care });

function Care() {
  const guides = useGuides();
  const [topic, setTopic] = useState<string>("All");
  const [license, setLicense] = useState<"all" | "licensed" | "guide">("all");
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guides.filter((guide) => {
      if (license === "licensed" && !guide.licensed) return false;
      if (license === "guide" && guide.licensed) return false;
      if (topic !== "All" && !guide.specialties.includes(topic)) return false;
      if (!q) return true;
      return (
        guide.name.toLowerCase().includes(q) ||
        guide.region.toLowerCase().includes(q) ||
        guide.specialties.some((item) => item.toLowerCase().includes(q))
      );
    });
  }, [guides, topic, license, query]);

  return (
    <div className="space-y-6">
      <section className="max-w-2xl space-y-3">
        <p className="text-sm font-medium text-muted">Care</p>
        <h1 className="font-display text-4xl tracking-tight">Guides, not a clinic.</h1>
        <p className="text-base leading-relaxed text-muted">
          The directory works like a teacher shelf: specialty, length, and a person you can follow. Sample
          names are fictional. Unlicensed people stay visible, and they cannot bill insurance.
        </p>
        <CrisisLine />
      </section>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search specialty or name"
        className="h-11 w-full rounded-md border border-border bg-card px-3 text-base"
        aria-label="Search guides"
      />
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "Everyone"],
            ["licensed", "Licensed"],
            ["guide", "Unlicensed"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setLicense(id)}
            className={cn(
              "min-h-11 rounded-full px-3 text-sm",
              license === id ? "bg-accent text-accent-foreground" : "border border-border bg-card",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["All", ...TOPICS].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTopic(item)}
            className={cn(
              "min-h-11 shrink-0 rounded-full px-3 text-sm",
              topic === item ? "bg-subtle text-foreground" : "text-muted",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <ul className="space-y-3">
        {shown.map((guide) => (
          <li key={guide.id}>
            <Link to="/care/$guideId" params={{ guideId: guide.id }} className="block rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-2xl">{guide.name}</h2>
                {guide.promoted ? <Badge>Promoted</Badge> : null}
                {guide.sample ? <Badge>Sample</Badge> : null}
                <Badge tone={guide.licensed ? "neutral" : "alert"}>
                  {guide.licensed ? "Licensed, unverified" : "Unlicensed"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted">
                {guide.credential} · {guide.region} · {dollars(guide.rateCents)}
              </p>
              <p className="mt-2 text-sm text-muted">{guide.specialties.join(" · ")}</p>
              <div className="mt-3">
                <LicenseNotice licensed={guide.licensed} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {shown.length === 0 ? <p className="text-sm text-muted">No guides match that filter.</p> : null}
    </div>
  );
}
