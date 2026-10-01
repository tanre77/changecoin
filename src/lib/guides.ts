export type Guide = {
  id: string;
  name: string;
  licensed: boolean;
  credential: string;
  region: string;
  bio: string;
  rateCents: number;
  specialties: string[];
  minutes: number[];
  promoted: boolean;
  sample: boolean;
};

export const TOPICS = [
  "Money stress",
  "Sleep",
  "Worry",
  "Grief",
  "Habits",
  "Relationships",
] as const;

export const SAMPLE_GUIDES: Guide[] = [
  {
    id: "mara-ellison",
    name: "Mara Ellison",
    licensed: true,
    credential: "LCSW · self-reported",
    region: "Ohio",
    bio: "Talks through money anxiety and the stories people tell themselves at the end of the month. Sample profile for the directory — not a real clinician.",
    rateCents: 14000,
    specialties: ["Money stress", "Worry"],
    minutes: [25, 50],
    promoted: true,
    sample: true,
  },
  {
    id: "andre-cole",
    name: "Andre Cole",
    licensed: false,
    credential: "No professional license",
    region: "Remote",
    bio: "Guides short wind-down sits and plain talk about sleep. Sample profile. Not a therapist and not eligible for insurance.",
    rateCents: 4500,
    specialties: ["Sleep", "Habits"],
    minutes: [20, 40],
    promoted: false,
    sample: true,
  },
  {
    id: "priya-raman",
    name: "Priya Raman",
    licensed: true,
    credential: "Psychologist · self-reported",
    region: "Illinois",
    bio: "Grief conversations at a human pace. Sample profile, license not verified by ChangeCoin.",
    rateCents: 18000,
    specialties: ["Grief", "Relationships"],
    minutes: [50],
    promoted: false,
    sample: true,
  },
  {
    id: "jonah-hale",
    name: "Jonah Hale",
    licensed: false,
    credential: "No professional license",
    region: "Remote",
    bio: "Peer support for spending shame and restarting a routine. Out of pocket only. Sample profile.",
    rateCents: 3500,
    specialties: ["Money stress", "Habits"],
    minutes: [20, 45],
    promoted: false,
    sample: true,
  },
  {
    id: "elena-voss",
    name: "Elena Voss",
    licensed: true,
    credential: "LMFT · self-reported",
    region: "Colorado",
    bio: "Relationship patterns, without advice that belongs to a courtroom or a crisis line. Sample profile.",
    rateCents: 16000,
    specialties: ["Relationships", "Worry"],
    minutes: [50],
    promoted: false,
    sample: true,
  },
  {
    id: "sam-okonkwo",
    name: "Sam Okonkwo",
    licensed: false,
    credential: "No professional license",
    region: "Remote",
    bio: "Silent sits and a short check-in after. Inspired by teacher directories, original to ChangeCoin. Sample profile.",
    rateCents: 2000,
    specialties: ["Sleep", "Worry"],
    minutes: [10, 20],
    promoted: false,
    sample: true,
  },
];

export type PracticeFields = {
  displayName: string;
  licensed: boolean;
  credentialLabel: string;
  region: string;
  bio: string;
  rateCents: number;
  specialties: string;
  promoted: boolean;
  published: boolean;
};

export function fieldsToGuide(fields: PracticeFields, id: string, sample: boolean): Guide {
  const specialties = fields.specialties
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
  return {
    id,
    name: fields.displayName || "Unnamed guide",
    licensed: fields.licensed,
    credential: fields.licensed
      ? `${fields.credentialLabel || "License self-reported"} · not verified`
      : "No professional license",
    region: fields.region || "Remote",
    bio: fields.bio,
    rateCents: fields.rateCents,
    specialties: specialties.length ? specialties : ["Habits"],
    minutes: fields.licensed ? [25, 50] : [20, 45],
    promoted: fields.published && fields.promoted,
    sample,
  };
}
