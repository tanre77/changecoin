export function LicenseNotice({ licensed }: { licensed: boolean }) {
  if (licensed) {
    return (
      <p className="text-sm leading-relaxed text-muted">
        Licensed clinician,{" "}
        <span className="font-medium text-foreground">self-reported and not verified by ChangeCoin</span>.
        A coverage request can go with an uploaded plan. Reimbursement is not guaranteed. This is not
        emergency care and not a diagnosis.
      </p>
    );
  }
  return (
    <p className="text-sm leading-relaxed text-foreground">
      Unlicensed wellness guide. This person is{" "}
      <span className="font-medium">not a licensed therapist</span>. Sessions are out of pocket only, cannot
      be billed to insurance, and are not medical treatment, diagnosis, or psychotherapy.
    </p>
  );
}

export function CrisisLine() {
  return (
    <p className="text-sm leading-relaxed text-muted">
      If you may act on thoughts of suicide or are in immediate danger, call 911. In the US, call or text
      988.
    </p>
  );
}
