import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, TextArea } from "@/components/ui/field";
import { getMyPractice, savePractice } from "@/lib/changecoin.functions";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useCc } from "@/lib/store";

export const Route = createFileRoute("/practice")({ component: Practice });

function Practice() {
  const { user, isPending } = useCurrentUserState();
  const practice = useCc((s) => s.practice);
  const setPractice = useCc((s) => s.setPractice);
  const acknowledged = useCc((s) => s.acknowledged);
  const setAcknowledged = useCc((s) => s.setAcknowledged);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!user) return;
    getMyPractice()
      .then((row) => {
        if (!row) return;
        setPractice({
          displayName: row.display_name,
          licensed: Boolean(row.licensed),
          credentialLabel: row.credential_label,
          region: row.region,
          bio: row.bio,
          rateCents: Number(row.rate_cents),
          specialties: row.specialties,
          promoted: Boolean(row.promoted),
          published: Boolean(row.published),
        });
      })
      .catch(() => undefined);
  }, [user, setPractice]);

  async function publish(published: boolean) {
    setPractice({ published });
    if (!user) {
      setNote("Saved on this device. Open ChangeCoin from Grok to publish it on the directory.");
      return;
    }
    try {
      await savePractice({
        data: { ...practice, published, acknowledged },
      });
      setNote(published ? "Published to the directory." : "Removed from the directory.");
    } catch (error) {
      setNote(error instanceof Error ? error.message : "Could not publish.");
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <section className="space-y-3">
        <p className="text-sm font-medium text-muted">Practitioner</p>
        <h1 className="font-display text-4xl tracking-tight">Promote the practice you actually have.</h1>
        <p className="text-sm leading-relaxed text-muted">
          The same Grok account is the practitioner login. There is no second password. License status is
          self-reported until a verification partner exists. Saying otherwise would mislead members and the
          stores.
        </p>
      </section>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void publish(true);
        }}
      >
        <div>
          <Label htmlFor="pname">Name on the directory</Label>
          <Input
            id="pname"
            value={practice.displayName}
            onChange={(event) => setPractice({ displayName: event.target.value })}
            required
          />
        </div>
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={practice.licensed}
            onChange={(event) => {
              setPractice({ licensed: event.target.checked });
              setAcknowledged(false);
            }}
          />
          I hold a professional license
        </label>
        {practice.licensed ? (
          <div>
            <Label htmlFor="cred">Credential and region of license</Label>
            <Input
              id="cred"
              value={practice.credentialLabel}
              onChange={(event) => setPractice({ credentialLabel: event.target.value })}
              placeholder="LCSW"
            />
          </div>
        ) : (
          <p className="text-sm leading-relaxed">
            You will be listed as an unlicensed wellness guide. Members will see that sessions are out of
            pocket and not billable to insurance. The word therapist will not be used as your title.
          </p>
        )}
        <div>
          <Label htmlFor="region">Where you meet</Label>
          <Input
            id="region"
            value={practice.region}
            onChange={(event) => setPractice({ region: event.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="specs">Specialties, separated by commas</Label>
          <Input
            id="specs"
            value={practice.specialties}
            onChange={(event) => setPractice({ specialties: event.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="rate">Session price in dollars</Label>
          <Input
            id="rate"
            type="number"
            min={0}
            max={500}
            value={Math.round(practice.rateCents / 100)}
            onChange={(event) => setPractice({ rateCents: Math.round(Number(event.target.value) * 100) })}
          />
        </div>
        <div>
          <Label htmlFor="bio">Short bio</Label>
          <TextArea id="bio" value={practice.bio} onChange={(event) => setPractice({ bio: event.target.value })} />
        </div>
        <label className="flex min-h-11 items-start gap-3 text-sm leading-relaxed">
          <input
            type="checkbox"
            className="mt-1"
            checked={practice.promoted}
            onChange={(event) => setPractice({ promoted: event.target.checked })}
          />
          Promote my listing. It sorts above others and is labeled Promoted. It is not a hidden ad.
        </label>
        <label className="flex min-h-11 items-start gap-3 text-sm leading-relaxed">
          <input
            type="checkbox"
            className="mt-1"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
          />
          {practice.licensed
            ? "I understand ChangeCoin will mark my license as self-reported and unverified, and I am responsible for staying inside that license."
            : "I understand I will be shown as unlicensed, out of pocket only, and not as someone who can bill insurance or provide treatment."}
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isPending || !acknowledged}>
            Publish
          </Button>
          <Button type="button" variant="secondary" onClick={() => void publish(false)}>
            Unpublish
          </Button>
        </div>
        {!user && !isPending ? (
          <p className="text-sm text-muted">
            Browsing works without an account. <Link to="/login">Account</Link> explains Grok sign-in, which
            is what publishes the listing.
          </p>
        ) : null}
        {note ? <p className="text-sm">{note}</p> : null}
      </form>
    </div>
  );
}
