import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { classifyCallToolError, redirectToLoginIfRequired, type CallToolResult } from "@/lib/app-data";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import {
  deleteMyData,
  getInsurance,
  makeDriveFolder,
  saveCrash,
  saveInsurance,
  searchDrive,
  type DrivePayload,
} from "@/lib/changecoin.functions";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useCc } from "@/lib/store";
import { firebaseConfigured, readCrashes, recordCrash, type CrashRecord } from "@/lib/telemetry";
import { walletHint } from "@/lib/wallet";

export const Route = createFileRoute("/you")({ component: You });

function asTool(result: DrivePayload): CallToolResult {
  return {
    ok: result.ok,
    data: null,
    errorMessage: result.errorMessage ?? undefined,
    loginRequired: result.loginRequired,
    loginUrl: result.loginUrl ?? undefined,
    pending: result.pending,
  };
}

function You() {
  const { user, isPending } = useCurrentUserState();
  const insurance = useCc((s) => s.insurance);
  const setInsurance = useCc((s) => s.setInsurance);
  const resetAll = useCc((s) => s.resetAll);
  const [preview, setPreview] = useState<string | null>(null);
  const [saved, setSaved] = useState("");
  const [driveNote, setDriveNote] = useState("Google Drive loads when you ask.");
  const [files, setFiles] = useState<string[]>([]);
  const [driveResult, setDriveResult] = useState<DrivePayload | null>(null);
  const [crashes, setCrashes] = useState<CrashRecord[]>([]);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    setCrashes(readCrashes());
    const onCrash = () => setCrashes(readCrashes());
    window.addEventListener("cc-crash", onCrash);
    return () => window.removeEventListener("cc-crash", onCrash);
  }, []);

  useEffect(() => {
    if (!user) return;
    getInsurance()
      .then((row) => {
        if (!row) return;
        setInsurance({
          payer: row.payer,
          plan: row.plan_name,
          memberLast4: row.member_last4,
          group: row.group_number,
          holder: row.holder_name,
        });
      })
      .catch(() => undefined);
  }, [user, setInsurance]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function loadDrive(q: string) {
    if (!user) {
      setDriveNote("Sign in from Grok so Drive uses the same person as your account.");
      return;
    }
    setDriveNote("Looking in Drive…");
    try {
      const result = await searchDrive({ data: { q } });
      setDriveResult(result);
      if (!result.ok) {
        const state = classifyCallToolError(asTool(result));
        setDriveNote(state?.message ?? "Drive did not respond.");
        setFiles([]);
        return;
      }
      setFiles(result.names);
      setDriveNote(result.names.length ? "Files from your Google Drive." : "No files matched. The folder can still be created.");
    } catch {
      setDriveNote("Drive is unavailable until this app is opened from Grok with Drive connected.");
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <section className="space-y-2">
        <p className="text-sm font-medium text-muted">You</p>
        <h1 className="font-display text-4xl tracking-tight">
          {isPending ? "Your account" : user?.displayName || user?.primaryEmail || "Your account"}
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Insurance photos are not kept. Only the plan name and the last four digits can be saved, and only
          for a coverage request to a licensed clinician.
        </p>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h2 className="font-display text-2xl">Insurance card</h2>
        <div>
          <Label htmlFor="payer">Payer</Label>
          <Input id="payer" value={insurance.payer} onChange={(e) => setInsurance({ payer: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="plan">Plan name</Label>
          <Input id="plan" value={insurance.plan} onChange={(e) => setInsurance({ plan: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="holder">Name on the card</Label>
          <Input id="holder" value={insurance.holder} onChange={(e) => setInsurance({ holder: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="member">Member ID, last 4</Label>
            <Input
              id="member"
              inputMode="numeric"
              maxLength={4}
              value={insurance.memberLast4}
              onChange={(e) => setInsurance({ memberLast4: e.target.value.replace(/\D/g, "").slice(0, 4) })}
            />
          </div>
          <div>
            <Label htmlFor="group">Group</Label>
            <Input id="group" value={insurance.group} onChange={(e) => setInsurance({ group: e.target.value })} />
          </div>
        </div>
        <div>
          <Label htmlFor="card">Upload a photo to check it</Label>
          <input
            id="card"
            type="file"
            accept="image/*"
            capture="environment"
            className="block w-full text-sm"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (preview) URL.revokeObjectURL(preview);
              setPreview(URL.createObjectURL(file));
              setInsurance({ fileLabel: file.name });
            }}
          />
          <p className="mt-2 text-sm text-muted">
            {insurance.fileLabel
              ? `${insurance.fileLabel} stays in this tab. It is not uploaded.`
              : "The photo is shown here and then discarded. ChangeCoin does not store the image."}
          </p>
          {preview ? <img src={preview} alt="Insurance card preview" className="mt-3 max-h-40 rounded-md" /> : null}
        </div>
        <Button
          onClick={() => {
            if (!user) {
              setSaved("Details stay on this device until you are signed in.");
              return;
            }
            void saveInsurance({ data: insurance })
              .then(() => setSaved("Redacted plan details saved to your account."))
              .catch(() => setSaved("Could not save. The details remain on this device."));
          }}
        >
          Save plan details
        </Button>
        {saved ? <p className="text-sm">{saved}</p> : null}
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h2 className="font-display text-2xl">Wallets</h2>
        <p className="text-sm leading-relaxed text-muted">{walletHint()}</p>
        <p className="text-sm leading-relaxed text-muted">
          Visits are real-world services, so Apple Pay and Google Pay are the payment path rather than an
          in-app digital purchase. This build never marks a card as charged.
        </p>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h2 className="font-display text-2xl">Google Drive</h2>
        <p className="text-sm leading-relaxed text-muted">
          ChangeCoin can list files and create a ChangeCoin folder. It cannot upload a document with the
          current Drive tools.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void loadDrive("trashed = false")}>Load recent files</Button>
          <Button variant="secondary" onClick={() => void loadDrive("name contains 'ChangeCoin'")}>
            Search ChangeCoin
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (!user) {
                setDriveNote("Sign in from Grok before creating a folder.");
                return;
              }
              void makeDriveFolder()
                .then((result) => {
                  setDriveResult(result);
                  setDriveNote(
                    result.ok
                      ? "ChangeCoin folder requested in Drive."
                      : (classifyCallToolError(asTool(result))?.message ?? "Could not create the folder."),
                  );
                })
                .catch(() => setDriveNote("Drive is unavailable from this preview until Grok connects it."));
            }}
          >
            Create folder
          </Button>
        </div>
        <p className="text-sm text-muted">{driveNote}</p>
        {driveResult?.loginRequired ? (
          <Button variant="secondary" onClick={() => redirectToLoginIfRequired(asTool(driveResult))}>
            Continue with Grok
          </Button>
        ) : null}
        {files.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {files.map((name, index) => (
              <li key={`${name}-${index}`} className="truncate">
                {name}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h2 className="font-display text-2xl">Diagnostics</h2>
        <p className="text-sm leading-relaxed text-muted">
          Firebase is installed.{" "}
          {firebaseConfigured()
            ? "A Firebase project is configured, so exceptions can also be sent to Analytics."
            : "No Firebase project keys are in this build, so crashes stay on the device."}{" "}
          Crashlytics itself is a native iOS and Android SDK. The store build forwards these same records
          there. The web app keeps a Crashlytics-style log because browsers have no Crashlytics product.
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            const row = recordCrash(new Error("Test non-fatal from diagnostics"), false);
            if (user) void saveCrash({ data: row }).catch(() => undefined);
          }}
        >
          Record a test non-fatal
        </Button>
        <ul className="space-y-2 text-sm">
          {crashes.length === 0 ? <li className="text-muted">No crashes recorded.</li> : null}
          {crashes.slice(0, 5).map((crash) => (
            <li key={crash.id}>
              <span className="text-muted">{crash.fatal ? "Fatal" : "Non-fatal"} · </span>
              {crash.message}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Policies</h2>
        <div className="flex flex-col gap-1 text-sm">
          <Link to="/legal" search={{ doc: "privacy" }} className="min-h-11 inline-flex items-center">
            Privacy
          </Link>
          <Link to="/legal" search={{ doc: "health" }} className="min-h-11 inline-flex items-center">
            Health and licenses
          </Link>
          <Link to="/legal" search={{ doc: "money" }} className="min-h-11 inline-flex items-center">
            Money and payments
          </Link>
          <Link to="/legal" search={{ doc: "stores" }} className="min-h-11 inline-flex items-center">
            App Store and Play checklist
          </Link>
          <Link to="/practice" className="min-h-11 inline-flex items-center">
            Practitioner login
          </Link>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-border p-4">
        <h2 className="font-display text-2xl">Delete ChangeCoin data</h2>
        <p className="text-sm leading-relaxed text-muted">
          This removes visits, insurance details, your practice listing, and crash notes tied to this
          account. Your Grok sign-in itself is separate and is not deleted here.
        </p>
        {armed ? (
          <Button
            onClick={() => {
              resetAll();
              localStorage.removeItem("cc-crashes");
              setCrashes([]);
              setArmed(false);
              if (user) void deleteMyData().catch(() => undefined);
              setSaved("ChangeCoin data on this device was cleared.");
            }}
          >
            Confirm delete
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => setArmed(true)}>
            Delete my data
          </Button>
        )}
      </section>
    </div>
  );
}
