import { createFileRoute, Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const DOCS = ["privacy", "health", "money", "stores"] as const;
type Doc = (typeof DOCS)[number];

export const Route = createFileRoute("/legal")({
  validateSearch: (search: Record<string, unknown>): { doc: Doc } => {
    const doc = search.doc;
    return { doc: DOCS.includes(doc as Doc) ? (doc as Doc) : "privacy" };
  },
  component: Legal,
});

function Legal() {
  const { doc } = Route.useSearch();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-4xl tracking-tight">The fine print, in plain words</h1>
      <div className="flex flex-wrap gap-2">
        {DOCS.map((item) => (
          <Link
            key={item}
            to="/legal"
            search={{ doc: item }}
            className={cn(
              "inline-flex min-h-11 items-center rounded-full px-3 text-sm capitalize",
              doc === item ? "bg-accent text-accent-foreground" : "border border-border",
            )}
          >
            {item}
          </Link>
        ))}
      </div>
      <article className="space-y-4 text-sm leading-relaxed text-muted">
        {doc === "privacy" ? <Privacy /> : null}
        {doc === "health" ? <Health /> : null}
        {doc === "money" ? <MoneyDoc /> : null}
        {doc === "stores" ? <Stores /> : null}
      </article>
    </div>
  );
}

function Privacy() {
  return (
    <>
      <p>
        ChangeCoin stores the profile you publish, redacted insurance fields, visit requests, and crash
        notes on your account. It does not store a photo of an insurance card, a full member ID, or a Social
        Security number.
      </p>
      <p>
        Google Drive is read through your Grok connection when you ask. Camera and microphone are used only
        during a video visit you start, and calls are not recorded by the app.
      </p>
      <p>
        The one advertisement is a labeled house ad on Home and Money. It is not shown on care, visits, or
        payment steps, and it is not used to target health topics.
      </p>
      <p>You can delete ChangeCoin records from You. That does not delete your Grok account.</p>
    </>
  );
}

function Health() {
  return (
    <>
      <p>
        ChangeCoin is not a medical device, not a hospital, and not a crisis service. It does not diagnose,
        treat, or prescribe. If you may act on thoughts of suicide, call 911. In the US, call or text 988.
      </p>
      <p>
        Licensed listings are self-reported. ChangeCoin does not verify a license. Every licensed profile
        says so. Unlicensed people are wellness guides. They are not titled therapists, their visits are out
        of pocket, and insurance cannot be selected.
      </p>
      <p>
        Sample profiles are fictional. Members can report and hide a listing. Practitioner bios are
        user-provided and should not claim outcomes the person cannot support.
      </p>
      <p>The free sit timer is a clock with a tone. It is not sold, so it is not a digital purchase.</p>
    </>
  );
}

function MoneyDoc() {
  return (
    <>
      <p>
        The Change Score is an educational model on numbers you type. It is not a consumer report, not a
        FICO or VantageScore, and not a lending decision. ChangeCoin does not pull a credit file and does
        not ask you to connect a bank.
      </p>
      <p>
        Apple Pay and Google Pay are offered for real-world visits. In this version the wallet sheet, when
        a merchant account exists, is completed as unknown rather than as a successful charge. Insurance is
        a coverage request to a licensed clinician, not a payment and not a guarantee.
      </p>
      <p>ChangeCoin is not a cryptocurrency, wallet, or exchange. Nothing here is bought, sold, or mined.</p>
    </>
  );
}

function Stores() {
  return (
    <>
      <p>
        This app is built for iPhone and Android home-screen install, and for a later store wrapper, on iOS
        16 and Android 8 or newer. That covers systems more than two years old as of 2026. No bleeding-edge
        browser API is required for the main screens.
      </p>
      <p>
        Apple guideline 3.1.3(e) allows payment methods other than In-App Purchase for person-to-person
        real-world services. Visits are that kind of service. The timer is free. Apple Pay still needs a
        merchant ID, domain association, and entitlement before a charge can succeed. Google Pay needs the
        same kind of merchant setup. The preview does not pretend a charge went through.
      </p>
      <p>
        Health copy avoids diagnosis and treatment claims, shows 988, rates 18+, and offers in-app deletion
        of app data. Ads are labeled, dismissible, and kept off care and video. User listings can be
        reported and hidden. Licenses are not described as verified.
      </p>
      <p>
        Play Console financial and health declarations should match this: no lending, no real credit
        report, no sale of health data, camera and microphone only for visits. Firebase is in the project.
        Native Crashlytics attaches in the iOS and Android binaries; the browser keeps the same event log
        because Crashlytics has no web SDK.
      </p>
      <p>
        Store review can still reject a build for policy reasons outside this screen. The product choices
        above are the ones that usually cause those rejections, and they are handled in the interface
        rather than only in a listing form.
      </p>
    </>
  );
}
