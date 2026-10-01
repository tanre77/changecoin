import { createFileRoute, Link } from "@tanstack/react-router";
import { CrisisLine } from "@/components/notices";
import { VideoRoom } from "@/components/video-room";
import { useCc } from "@/lib/store";
import { dollars } from "@/lib/utils";

export const Route = createFileRoute("/visit")({ component: Visit });

function Visit() {
  const bookings = useCc((s) => s.bookings);
  const next = bookings[0];

  return (
    <div className="space-y-6">
      <section className="max-w-2xl space-y-3">
        <p className="text-sm font-medium text-muted">Visit</p>
        <h1 className="font-display text-4xl tracking-tight">The call stays between you two.</h1>
        <CrisisLine />
      </section>
      <section className="space-y-3">
        <h2 className="font-display text-2xl">Upcoming</h2>
        {bookings.length === 0 ? (
          <p className="text-sm text-muted">
            No visits yet. <Link to="/care" className="underline">Choose a guide</Link>.
          </p>
        ) : (
          <ul className="space-y-3">
            {bookings.map((booking) => (
              <li key={booking.id} className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-display text-xl">{booking.guideName}</h3>
                <p className="mt-1 text-sm text-muted">
                  {booking.when} · {booking.minutes} min · {dollars(booking.cents)} ·{" "}
                  {booking.pay === "insurance" ? "Insurance request" : booking.pay === "apple" ? "Apple Pay" : "Google Pay"}
                </p>
                <p className="mt-2 text-sm">{booking.status}</p>
                <p className="mt-2 text-sm tabular-nums text-muted">Room {booking.room}</p>
                {!booking.licensed ? (
                  <p className="mt-2 text-sm">Out of pocket. This guide is not licensed and insurance does not apply.</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
      <VideoRoom initialRoom={next?.room} />
    </div>
  );
}
