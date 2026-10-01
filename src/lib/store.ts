import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LedgerAccount, ScoreModel } from "./money";
import type { PracticeFields } from "./guides";

export type Booking = {
  id: string;
  guideId: string;
  guideName: string;
  licensed: boolean;
  when: string;
  minutes: number;
  cents: number;
  pay: "apple" | "google" | "insurance";
  status: string;
  room: string;
};

export type InsuranceDraft = {
  payer: string;
  plan: string;
  memberLast4: string;
  group: string;
  holder: string;
  fileLabel: string;
};

type State = {
  accounts: LedgerAccount[];
  model: ScoreModel;
  income: number;
  follows: string[];
  hidden: string[];
  bookings: Booking[];
  insurance: InsuranceDraft;
  practice: PracticeFields;
  acknowledged: boolean;
  setAccount: (id: string, patch: Partial<LedgerAccount>) => void;
  addCard: () => void;
  setModel: (patch: Partial<ScoreModel>) => void;
  setIncome: (income: number) => void;
  toggleFollow: (id: string) => void;
  hideGuide: (id: string) => void;
  addBooking: (booking: Booking) => void;
  setInsurance: (patch: Partial<InsuranceDraft>) => void;
  setPractice: (patch: Partial<PracticeFields>) => void;
  setAcknowledged: (value: boolean) => void;
  resetAll: () => void;
};

const accounts: LedgerAccount[] = [
  { id: "visa", name: "Harbor Visa", kind: "card", balance: 2400, limit: 8000, onTime: 100 },
  { id: "auto", name: "Northline Auto", kind: "loan", balance: 9200, limit: 9200, onTime: 100 },
  { id: "save", name: "Paper savings", kind: "savings", balance: 4100, limit: 0, onTime: 100 },
];

const insurance: InsuranceDraft = {
  payer: "",
  plan: "",
  memberLast4: "",
  group: "",
  holder: "",
  fileLabel: "",
};

export const emptyPractice: PracticeFields = {
  displayName: "",
  licensed: false,
  credentialLabel: "",
  region: "",
  bio: "",
  rateCents: 5000,
  specialties: "",
  promoted: false,
  published: false,
};

const fresh = {
  accounts,
  model: { months: 84, inquiries: 1 },
  income: 6400,
  follows: [] as string[],
  hidden: [] as string[],
  bookings: [] as Booking[],
  insurance,
  practice: emptyPractice,
  acknowledged: false,
};

export const useCc = create<State>()(
  persist(
    (set) => ({
      ...fresh,
      accounts: fresh.accounts.map((a) => ({ ...a })),
      setAccount: (id, patch) =>
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      addCard: () =>
        set((s) => ({
          accounts: [
            ...s.accounts,
            {
              id: `card-${s.accounts.length + 1}`,
              name: "New card",
              kind: "card",
              balance: 0,
              limit: 1000,
              onTime: 100,
            },
          ],
        })),
      setModel: (patch) => set((s) => ({ model: { ...s.model, ...patch } })),
      setIncome: (income) => set({ income }),
      toggleFollow: (id) =>
        set((s) => ({
          follows: s.follows.includes(id) ? s.follows.filter((x) => x !== id) : [...s.follows, id],
        })),
      hideGuide: (id) => set((s) => ({ hidden: s.hidden.includes(id) ? s.hidden : [...s.hidden, id] })),
      addBooking: (booking) => set((s) => ({ bookings: [booking, ...s.bookings] })),
      setInsurance: (patch) => set((s) => ({ insurance: { ...s.insurance, ...patch } })),
      setPractice: (patch) => set((s) => ({ practice: { ...s.practice, ...patch } })),
      setAcknowledged: (acknowledged) => set({ acknowledged }),
      resetAll: () =>
        set({
          ...fresh,
          accounts: fresh.accounts.map((a) => ({ ...a })),
          insurance: { ...insurance },
          practice: { ...emptyPractice },
          follows: [],
          hidden: [],
          bookings: [],
        }),
    }),
    { name: "changecoin", skipHydration: true },
  ),
);
