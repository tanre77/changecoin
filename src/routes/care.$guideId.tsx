import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CrisisLine, LicenseNotice } from "@/components/notices";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { saveBooking, reportGuide } from "@/lib/changecoin.functions";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useCc } from "@/lib/store";
import { useGuides } from "@/lib/use-guides";
import { dollars, roomCode } from "@/lib/utils";
import { openWallet, walletHint } from "@/lib/wallet";

export const Route = createFileRoute("/care/$guideId")({ component: GuidePage });

function slots() {
  const days = ["Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = ["9:00", "12:30", "17:00"];
  return days.flatMap((day) => hours.map((hour) => `${day} ${hour}`)).slice(0, 6);
}

function GuidePage() {
  const { guideId } = Route.useParams();
  const guides = useGuides();
  const guide = guides.find((item) => item.id === guideId);
  const follows = useCc((s) => s.follows);
  const toggleFollow = useCc((s) => s.toggleFollow);
  const hideGuide = useCc((s) => s.hideGuide);
  const addBooking = useCc((s) => s.addBooking);
  const insurance = useCc((s) => s.insurance);
  const { user } = useCurrentUserState();
  const [minutes, setMinutes] = useState(guide?.minutes[0] ?? 20);
  const [when, setWhen] = useState(slots()[0]);
  const [note, setNote] = useState("");
  const [left, setLeft] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (guide) setMinutes(guide.minutes[0] ?? 20);
  }, [guide]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          setRunning(false);
          void chime();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  if (!guide) {
    return (
      <div className="space-y-3">
        <h1 className="font-display text-3xl">That profile is hidden or missing.</h1>
        <Link to="/care" className="inline-flex min-h-11 items-center text-sm font-medium">
          Back to care
        </Link>
      </div>
    );
  }

  const insuranceReady = insurance.payer.trim().length > 1 && insurance.memberLast4.length === 4;
  const following = follows.includes(guide.id);

  async function book(pay: "apple" | "google" | "insurance") {
    if (pay === "insurance" && !guide) return;
    if (pay !== "insurance" && guide) {
      const wallet = await openWallet(pay, guide.rateCents, `Visit with ${guide.name}`);
      if (wallet === "cancel") {
        setNote("Wallet closed. Nothing was charged.");
        return;
      }
    }
    const booking = {
      id: roomCode(),
      guideId: guide!.id,
      guideName: guide!.name,
      licensed: guide!.licensed,
      when,
      minutes,
      cents: guide!.rateCents,
      pay,
      status:
        pay === "insurance"
          ? "Coverage request only. Not approved and not a charge."
          : "Requested. Wallet was not charged in this version.",
      room: roomCode(),
    };
    addBooking(booking);
    if (user) {
      try {
        await saveBooking({ data: booking });
      } catch {
        setNote("Saved on this device. Sign in to keep it on your account.");
        return;
      }
    }
    setNote(
      pay === "insurance"
        ? "Request saved. Insurance is not guaranteed, and only licensed clinicians can receive it."
        : `${walletHint()} The visit is on your list. No card was charged.`,
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/care" className="inline-flex min-h-11 items-center text-sm text-muted">
        All guides
      </Link>
      <header className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {guide.sample ? <Badge>Sample</Badge> : null}
          {guide.promoted ? <Badge>Promoted</Badge> : null}
          <Badge tone={guide.licensed ? "neutral" : "alert"}>
            {guide.licensed ? "Licensed, unverified" : "Unlicensed"}
          </Badge>
        </div>
        <h1 className="font-display text-4xl tracking-tight">{guide.name}</h1>
        <p className="text-sm text-muted">
          {guide.credential} · {guide.region}
        </p>
        <LicenseNotice licensed={guide.licensed} />
        <CrisisLine />
      </header>
      <p className="max-w-2xl text-base leading-relaxed">{guide.bio}</p>
      <p className="text-sm text-muted">{guide.specialties.join(" · ")}</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => toggleFollow(guide.id)}>
          {following ? "Following" : "Follow"}
        </Button>
        <Button
          variant="quiet"
          onClick={() => {
            hideGuide(guide.id);
            if (user) {
              void reportGuide({ data: { guideId: guide.id, reason: "Hidden by member" } }).catch(() => undefined);
            }
          }}
        >
          Report and hide
        </Button>
      </div>
      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h2 className="font-display text-2xl">A quiet sit</h2>
        <p className="text-sm text-muted">Free on-device timer. No audio file, just a soft tone at the end.</p>
        <p className="font-display text-4xl tabular-nums">
          {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
        </p>
        <div className="flex flex-wrap gap-2">
          {[10, 20].map((mins) => (
            <Button
              key={mins}
              variant="secondary"
              onClick={() => {
                setRunning(false);
                setLeft(mins * 60);
              }}
            >
              {mins} min
            </Button>
          ))}
          <Button onClick={() => left > 0 && setRunning(true)} disabled={left === 0}>
            Start
          </Button>
          <Button variant="quiet" onClick={() => setRunning(false)}>
            Pause
          </Button>
        </div>
      </section>
      <section className="space-y-4 rounded-xl border border-border bg-card p-4">
        <h2 className="font-display text-2xl">Book a visit · {dollars(guide.rateCents)}</h2>
        <div className="flex flex-wrap gap-2">
          {guide.minutes.map((value) => (
            <Button key={value} variant={value === minutes ? "primary" : "secondary"} onClick={() => setMinutes(value)}>
              {value} min
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {slots().map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setWhen(slot)}
              className={
                slot === when
                  ? "min-h-11 rounded-md bg-accent px-3 text-sm text-accent-foreground"
                  : "min-h-11 rounded-md border border-border px-3 text-sm"
              }
            >
              {slot}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button onClick={() => void book("apple")}>Pay with Apple Pay</Button>
          <Button variant="secondary" onClick={() => void book("google")}>
            Pay with Google Pay
          </Button>
          <Button variant="secondary" disabled={!guide.licensed || !insuranceReady} onClick={() => void book("insurance")}>
            Use insurance
          </Button>
        </div>
        {!guide.licensed ? (
          <p className="text-sm text-foreground">Insurance stays off. Unlicensed visits are out of pocket.</p>
        ) : !insuranceReady ? (
          <p className="text-sm text-muted">
            Add a plan under You before a coverage request. The card image is not stored.
          </p>
        ) : (
          <p className="text-sm text-muted">A coverage request is not an approval.</p>
        )}
        <p className="text-sm text-muted">{walletHint()}</p>
        {note ? <p className="text-sm text-foreground">{note}</p> : null}
      </section>
    </div>
  );
}

function chime() {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 528;
  gain.gain.value = 0.04;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
  osc.onended = () => void ctx.close();
}
