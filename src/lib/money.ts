export type LedgerAccount = {
  id: string;
  name: string;
  kind: "card" | "loan" | "savings";
  balance: number;
  limit: number;
  onTime: number;
};

export type ScoreModel = {
  months: number;
  inquiries: number;
};

export type Breakdown = {
  score: number;
  onTime: number;
  util: number;
  age: number;
  mix: number;
  inquiries: number;
};

export const OPENING_SCORE = 738;

export function breakdown(accounts: LedgerAccount[], model: ScoreModel): Breakdown {
  const cards = accounts.filter((a) => a.kind === "card");
  const debts = accounts.filter((a) => a.kind !== "savings");
  const onTime = debts.length
    ? debts.reduce((sum, a) => sum + clamp(a.onTime, 0, 100), 0) / debts.length / 100
    : 1;
  const limit = cards.reduce((sum, a) => sum + Math.max(0, a.limit), 0);
  const bal = cards.reduce((sum, a) => sum + Math.max(0, a.balance), 0);
  const util = limit > 0 ? Math.min(1, bal / limit) : 0;
  const kinds = new Set(accounts.map((a) => a.kind)).size;
  const age = Math.min(1, Math.max(0, model.months) / 240);
  const mix = Math.min(1, kinds / 3);
  const inquiries = Math.max(0, 1 - Math.max(0, model.inquiries) / 6);
  const weighted = onTime * 0.35 + (1 - util) * 0.3 + age * 0.15 + mix * 0.1 + inquiries * 0.1;
  return {
    score: Math.round(300 + 550 * weighted),
    onTime,
    util,
    age,
    mix,
    inquiries,
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function band(score: number) {
  if (score >= 750) return "Strong shape";
  if (score >= 670) return "Steady";
  if (score >= 580) return "Room to move";
  return "Under pressure";
}
