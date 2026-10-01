import { Link, useRouterState } from "@tanstack/react-router";
import { CircleUser, HeartHandshake, House, Landmark, Video } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCc } from "@/lib/store";
import { installCrashHandlers } from "@/lib/telemetry";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: House },
  { to: "/money", label: "Money", icon: Landmark },
  { to: "/care", label: "Care", icon: HeartHandshake },
  { to: "/visit", label: "Visit", icon: Video },
  { to: "/you", label: "You", icon: CircleUser },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [gate, setGate] = useState<"ask" | "no" | "yes">("ask");

  useEffect(() => {
    void useCc.persist.rehydrate();
    installCrashHandlers();
    const stored = localStorage.getItem("cc-adult");
    if (stored === "yes") setGate("yes");
    if (stored === "no") setGate("no");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="font-display text-xl tracking-tight">
            ChangeCoin
          </Link>
          <div className="flex items-center gap-3 text-sm text-muted">
            <span className="hidden sm:inline">Not a bank. Not medical care.</span>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <Link to="/login" className="min-h-11 inline-flex items-center">
                Account
              </Link>
            </SignedOut>
          </div>
        </div>
        <nav className="mx-auto hidden max-w-5xl gap-1 px-4 pb-3 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} label={item.label} pathname={pathname} />
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 md:pb-16">
        {gate === "yes" ? children : <AgeGate gate={gate} onChoose={setGate} />}
      </main>
      <nav
        className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background md:hidden"
        aria-label="Primary"
      >
        <ul className="mx-auto grid max-w-5xl grid-cols-5">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 text-xs",
                    active ? "text-foreground" : "text-muted",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function NavLink({ to, label, pathname }: { to: string; label: string; pathname: string }) {
  const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex min-h-11 items-center rounded-md px-3 text-sm",
        active ? "bg-subtle text-foreground" : "text-muted",
      )}
    >
      {label}
    </Link>
  );
}

function AgeGate({
  gate,
  onChoose,
}: {
  gate: "ask" | "no" | "yes";
  onChoose: (value: "ask" | "no" | "yes") => void;
}) {
  if (gate === "no") {
    return (
      <section className="mx-auto max-w-lg space-y-4">
        <h1 className="font-display text-3xl tracking-tight">ChangeCoin is for adults</h1>
        <p className="text-base leading-relaxed text-muted">
          This app is not for anyone under 18. If you are in danger, call 911. In the US, call or text 988.
        </p>
      </section>
    );
  }
  return (
    <section className="mx-auto max-w-lg space-y-4">
      <p className="text-sm font-medium text-muted">Adults 18 and older</p>
      <h1 className="font-display text-3xl tracking-tight">Before you continue</h1>
      <p className="text-base leading-relaxed text-muted">
        ChangeCoin covers personal finances and wellness visits. It is not for minors, and it is not
        emergency care.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="min-h-11 rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground"
          onClick={() => {
            localStorage.setItem("cc-adult", "yes");
            onChoose("yes");
          }}
        >
          I am 18 or older
        </button>
        <button
          type="button"
          className="min-h-11 rounded-md border border-border bg-card px-4 text-sm font-medium"
          onClick={() => {
            localStorage.setItem("cc-adult", "no");
            onChoose("no");
          }}
        >
          I am under 18
        </button>
      </div>
    </section>
  );
}
