export function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const t = Math.min(1, Math.max(0, (score - 300) / 550));
  const dash = t * circ;
  return (
    <svg viewBox="0 0 140 140" className="size-36 text-foreground" aria-hidden="true">
      <circle cx="70" cy="70" r={radius} fill="none" className="stroke-subtle" strokeWidth="8" />
      <circle
        cx="70"
        cy="70"
        r={radius}
        fill="none"
        className="stroke-accent"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`}
        transform="rotate(-90 70 70)"
      />
      <text
        x="70"
        y="78"
        textAnchor="middle"
        fill="currentColor"
        fontSize="32"
        fontFamily="var(--font-display)"
      >
        {score}
      </text>
    </svg>
  );
}
