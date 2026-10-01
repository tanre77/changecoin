import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { AdSlot } from "@/components/ad-slot";
import { ScoreRing } from "@/components/score-ring";
import { Button } from "@/components/ui/button";
import { band, breakdown, OPENING_SCORE } from "@/lib/money";
import { useCc } from "@/lib/store";

export const Route = createFileRoute("/money")({ component: Money });

const SPEND = [
  { name: "Home", amount: 1800 },
  { name: "Food", amount: 620 },
  { name: "Transit", amount: 240 },
  { name: "Care", amount: 80 },
  { name: "Other", amount: 410 },
];

function Money() {
  const accounts = useCc((s) => s.accounts);
  const model = useCc((s) => s.model);
  const income = useCc((s) => s.income);
  const setAccount = useCc((s) => s.setAccount);
  const addCard = useCc((s) => s.addCard);
  const setModel = useCc((s) => s.setModel);
  const setIncome = useCc((s) => s.setIncome);
  const view = breakdown(accounts, model);
  const factors = [
    ["Payment history", view.onTime],
    ["Card balances", 1 - view.util],
    ["Age of accounts", view.age],
    ["Mix", view.mix],
    ["New applications", view.inquiries],
  ] as const;

  return (
    <div className="space-y-8">
      <section className="max-w-2xl space-y-3">
        <p className="text-sm font-medium text-muted">Finances</p>
        <h1 className="font-display text-4xl tracking-tight">A score you can pull apart.</h1>
        <p className="text-base leading-relaxed text-muted">
          This is a sample household, closer to a credit dashboard than a bank login. ChangeCoin does not
          pull a bureau file, does not ask for a Social Security number, and this number is not a FICO or
          VantageScore.
        </p>
      </section>
      <section className="flex flex-col gap-6 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <ScoreRing score={view.score} />
        <div>
          <p className="font-display text-3xl">{band(view.score)}</p>
          <p className="mt-1 text-sm tabular-nums text-muted">
            {view.score - OPENING_SCORE >= 0 ? "+" : ""}
            {view.score - OPENING_SCORE} versus the opening sample of {OPENING_SCORE}
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
            Weights are a teaching model: history 35, balances 30, age 15, mix 10, new credit 10. Editing a
            number changes only this estimate.
          </p>
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="font-display text-2xl">Factors</h2>
        <ul className="space-y-3">
          {factors.map(([label, value]) => (
            <li key={label}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{label}</span>
                <span className="tabular-nums text-muted">{Math.round(value * 100)}</span>
              </div>
              <div className="h-2 rounded-full bg-subtle">
                <div className="h-2 rounded-full bg-accent" style={{ width: `${Math.round(value * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          Oldest account, in months
          <input
            type="range"
            min={0}
            max={240}
            value={model.months}
            onChange={(event) => setModel({ months: Number(event.target.value) })}
            className="mt-2 w-full"
          />
          <span className="tabular-nums text-muted">{model.months}</span>
        </label>
        <label className="block text-sm">
          Recent applications
          <input
            type="range"
            min={0}
            max={6}
            value={model.inquiries}
            onChange={(event) => setModel({ inquiries: Number(event.target.value) })}
            className="mt-2 w-full"
          />
          <span className="tabular-nums text-muted">{model.inquiries}</span>
        </label>
      </section>
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl">Accounts</h2>
          <Button variant="secondary" onClick={addCard}>
            Add a card
          </Button>
        </div>
        <ul className="space-y-3">
          {accounts.map((account) => (
            <li key={account.id} className="rounded-xl border border-border bg-card p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  Name
                  <input
                    value={account.name}
                    onChange={(event) => setAccount(account.id, { name: event.target.value })}
                    className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-base"
                  />
                </label>
                <p className="self-end text-sm capitalize text-muted">{account.kind}</p>
                <label className="text-sm">
                  Balance
                  <input
                    type="number"
                    min={0}
                    value={account.balance}
                    onChange={(event) => setAccount(account.id, { balance: Number(event.target.value) })}
                    className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-base tabular-nums"
                  />
                </label>
                {account.kind === "card" ? (
                  <label className="text-sm">
                    Limit
                    <input
                      type="number"
                      min={0}
                      value={account.limit}
                      onChange={(event) => setAccount(account.id, { limit: Number(event.target.value) })}
                      className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-base tabular-nums"
                    />
                  </label>
                ) : null}
                {account.kind !== "savings" ? (
                  <label className="text-sm sm:col-span-2">
                    On-time share
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={account.onTime}
                      onChange={(event) => setAccount(account.id, { onTime: Number(event.target.value) })}
                      className="mt-2 w-full"
                    />
                  </label>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-2xl">Sample month</h2>
          <label className="text-sm">
            Income
            <input
              type="number"
              min={0}
              value={income}
              onChange={(event) => setIncome(Number(event.target.value))}
              className="mt-1 h-11 w-32 rounded-md border border-border bg-card px-3 text-base tabular-nums"
            />
          </label>
        </div>
        <p className="text-sm text-muted">
          Spending bars are a fixed sample, not a linked bank. Left after those bills:{" "}
          <span className="tabular-nums text-foreground">
            ${Math.round(income - SPEND.reduce((sum, row) => sum + row.amount, 0)).toLocaleString()}
          </span>
        </p>
        <div className="h-52 w-full rounded-xl border border-border bg-card p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={SPEND}>
              <XAxis dataKey="name" tick={{ fill: "currentColor", fontSize: 12 }} stroke="var(--color-border)" />
              <YAxis tick={{ fill: "currentColor", fontSize: 12 }} stroke="var(--color-border)" width={40} />
              <Bar dataKey="amount" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <AdSlot />
    </div>
  );
}
