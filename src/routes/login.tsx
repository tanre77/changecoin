import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <main className="mx-auto max-w-md space-y-3">
        <h1 className="font-display text-3xl">Checking your session</h1>
        <p className="text-sm text-muted">ChangeCoin uses the Grok account already with this app.</p>
      </main>
    );
  }
  if (user) return <Navigate to="/" />;
  return (
    <main className="mx-auto max-w-md space-y-4">
      <p className="text-sm font-medium text-muted">Account</p>
      <h1 className="font-display text-4xl tracking-tight">One sign-in, for members and practitioners.</h1>
      <p className="text-sm leading-relaxed text-muted">
        Open ChangeCoin from Grok and the account is already there, including the practitioner tools. A
        separate Google or X login is not offered, so Google Drive stays on the same person as your visits.
      </p>
      <p className="text-sm leading-relaxed text-muted">
        You can browse the sample directory and the money model without an account. Publishing a practice,
        saving a plan, and joining a video room need the Grok session.
      </p>
      <Link to="/" className="inline-flex min-h-11 items-center text-sm font-medium">
        Continue browsing
      </Link>
    </main>
  );
}
