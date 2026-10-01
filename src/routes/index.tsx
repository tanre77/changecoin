import { createFileRoute, Link } from "@tanstack/react-router";
import { AdSlot } from "@/components/ad-slot";
import { ScoreRing } from "@/components/score-ring";
import { band, breakdown } from "@/lib/money";
import { useCc } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const accounts = useCc((s) => s.accounts);
  const model = useCc((s) => s.model);
  const bookings = useCc((s) => s.bookings);
  const next = bookings[0];
  const score = breakdown(accounts, model).score;
  const delta = score - 738;

  return (
    <div className="space-y-8">
      <section className="max-w-xl space-y-3">
        <p className="text-sm font-medium text-muted">Today</p>
        <h1 className="font-display text-4xl tracking-tight">Money, then a person to sit with.</h1>
        <p className="text-base leading-relaxed text-muted">
          ChangeCoin is a name, not a cryptocurrency. The score is an educational model you can edit. Visits
          are with sample guides or a practice you publish yourself.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <Link to="/money" className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <ScoreRing score={score} />
          <div className="min-w-0">
            <p className="text-sm text-muted">Change Score</p>
            <p className="font-display text-2xl">{band(score)}</p>
            <p className="text-sm tabular-nums text-muted">
              {delta === 0 ? "Matches the sample start" : `${delta > 0 ? "+" : ""}${delta} from the sample start`}
            </p>
            <p className="mt-2 text-sm text-muted">Not a credit report.</p>
          </div>
        </Link>
        <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4">
          <div>
            <p className="text-sm text-muted">Next visit</p>
            <h2 className="mt-1 font-display text-2xl">{next ? next.guideName : "Nothing booked"}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {next
                ? `${next.when} · ${next.minutes} min · ${next.status}`
                : "Licensed clinicians and unlicensed guides are labeled before you pay."}
            </p>
          </div>
          <Link to={next ? "/visit" : "/care"} className="mt-4 inline-flex min-h-11 items-center text-sm font-medium">
            {next ? "Open the visit" : "Browse care"}
          </Link>
        </div>
      </section>
      <section className="grid gap-3 sm:grid-cols-3">
        <Link to="/care" className="rounded-xl border border-border bg-card p-4">
          <h2 className="font-display text-xl">Find a guide</h2>
          <p className="mt-2 text-sm text-muted">Sits, specialties, and a clear license line.</p>
        </Link>
        <Link to="/practice" className="rounded-xl border border-border bg-card p-4">
          <h2 className="font-display text-xl">Your practice</h2>
          <p className="mt-2 text-sm text-muted">Practitioners sign in and can promote a listing.</p>
        </Link>
        <Link to="/you" className="rounded-xl border border-border bg-card p-4">
          <h2 className="font-display text-xl">Plan and Drive</h2>
          <p className="mt-2 text-sm text-muted">Insurance details, Google Drive, and wallets.</p>
        </Link>
      </section>
      <p className="text-sm text-muted">
        Installs on iPhone and Android, including iOS 16 and Android 8 — systems older than two years.
      </p>
      <AdSlot />
    </div>
  );
}
