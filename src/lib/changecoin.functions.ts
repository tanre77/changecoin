import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

export type PracticeRow = {
  user_id: string;
  display_name: string;
  licensed: boolean;
  credential_label: string;
  region: string;
  bio: string;
  rate_cents: number;
  specialties: string;
  promoted: boolean;
  published: boolean;
};

export type InsuranceRow = {
  payer: string;
  plan_name: string;
  member_last4: string;
  group_number: string;
  holder_name: string;
};

export type BookingRow = {
  id: string;
  guide_id: string;
  guide_name: string;
  licensed: boolean;
  starts_at: string;
  minutes: number;
  amount_cents: number;
  pay_method: string;
  status: string;
  room_code: string;
};

export type SignalRow = {
  id: number;
  room: string;
  sender: string;
  kind: string;
  payload: string;
};

function clean(value: unknown, max: number) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export const listPublishedPractices = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<PracticeRow>`
    select user_id, display_name, licensed, credential_label, region, bio,
           rate_cents, specialties, promoted, published
    from practices
    where published = true
    order by promoted desc, display_name asc
  `;
});

type PracticeInput = {
  displayName: string;
  licensed: boolean;
  credentialLabel: string;
  region: string;
  bio: string;
  rateCents: number;
  specialties: string;
  promoted: boolean;
  published: boolean;
  acknowledged: boolean;
};

export const savePractice = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: PracticeInput) => {
    const published = Boolean(input?.published);
    if (published && !input?.acknowledged) {
      throw new Error("Acknowledgement required to publish");
    }
    const displayName = clean(input?.displayName, 80);
    if (published && displayName.length < 2) throw new Error("Name is required");
    const licensed = Boolean(input?.licensed);
    return {
      displayName: displayName || "Guide",
      licensed,
      credentialLabel: clean(input?.credentialLabel, 80),
      region: clean(input?.region, 80),
      bio: clean(input?.bio, 600),
      rateCents: Math.max(0, Math.min(50000, Math.round(Number(input?.rateCents) || 0))),
      specialties: clean(input?.specialties, 160),
      promoted: published && Boolean(input?.promoted),
      published,
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into practices (
        user_id, display_name, licensed, credential_label, region, bio,
        rate_cents, specialties, promoted, published, updated_at
      ) values (
        ${context.userId}, ${data.displayName}, ${data.licensed}, ${data.credentialLabel},
        ${data.region}, ${data.bio}, ${data.rateCents}, ${data.specialties},
        ${data.promoted}, ${data.published}, now()
      )
      on conflict (user_id) do update set
        display_name = excluded.display_name,
        licensed = excluded.licensed,
        credential_label = excluded.credential_label,
        region = excluded.region,
        bio = excluded.bio,
        rate_cents = excluded.rate_cents,
        specialties = excluded.specialties,
        promoted = excluded.promoted,
        published = excluded.published,
        updated_at = now()
    `;
    return { ok: true as const };
  });

export const getMyPractice = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<PracticeRow>`
      select user_id, display_name, licensed, credential_label, region, bio,
             rate_cents, specialties, promoted, published
      from practices where user_id = ${context.userId}
    `;
    return rows[0] ?? null;
  });

type InsuranceInput = {
  payer: string;
  plan: string;
  memberLast4: string;
  group: string;
  holder: string;
};

export const saveInsurance = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: InsuranceInput) => {
    const digits = String(input?.memberLast4 ?? "").replace(/\D/g, "");
    return {
      payer: clean(input?.payer, 80),
      plan: clean(input?.plan, 80),
      memberLast4: digits.slice(-4),
      group: clean(input?.group, 40),
      holder: clean(input?.holder, 80),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into insurance_profiles (
        user_id, payer, plan_name, member_last4, group_number, holder_name, updated_at
      ) values (
        ${context.userId}, ${data.payer}, ${data.plan}, ${data.memberLast4},
        ${data.group}, ${data.holder}, now()
      )
      on conflict (user_id) do update set
        payer = excluded.payer,
        plan_name = excluded.plan_name,
        member_last4 = excluded.member_last4,
        group_number = excluded.group_number,
        holder_name = excluded.holder_name,
        updated_at = now()
    `;
    return { ok: true as const, memberLast4: data.memberLast4 };
  });

export const getInsurance = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<InsuranceRow>`
      select payer, plan_name, member_last4, group_number, holder_name
      from insurance_profiles where user_id = ${context.userId}
    `;
    return rows[0] ?? null;
  });

type BookingInput = {
  id: string;
  guideId: string;
  guideName: string;
  licensed: boolean;
  when: string;
  minutes: number;
  cents: number;
  pay: string;
  status: string;
  room: string;
};

export const saveBooking = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: BookingInput) => {
    const pay = input?.pay === "insurance" || input?.pay === "apple" || input?.pay === "google" ? input.pay : "apple";
    const licensed = Boolean(input?.licensed);
    if (pay === "insurance" && !licensed) throw new Error("Insurance is only for licensed clinicians");
    return {
      id: clean(input?.id, 40),
      guideId: clean(input?.guideId, 80),
      guideName: clean(input?.guideName, 80),
      licensed,
      when: clean(input?.when, 80),
      minutes: Math.max(10, Math.min(120, Math.round(Number(input?.minutes) || 20))),
      cents: Math.max(0, Math.min(50000, Math.round(Number(input?.cents) || 0))),
      pay,
      status: clean(input?.status, 180),
      room: clean(input?.room, 12).toUpperCase(),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into bookings (
        id, user_id, guide_id, guide_name, licensed, starts_at, minutes,
        amount_cents, pay_method, status, room_code
      ) values (
        ${data.id}, ${context.userId}, ${data.guideId}, ${data.guideName}, ${data.licensed},
        ${data.when}, ${data.minutes}, ${data.cents}, ${data.pay}, ${data.status}, ${data.room}
      )
      on conflict (id) do nothing
    `;
    return { ok: true as const };
  });

export const listBookings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<BookingRow>`
      select id, guide_id, guide_name, licensed, starts_at, minutes,
             amount_cents, pay_method, status, room_code
      from bookings
      where user_id = ${context.userId}
      order by created_at desc
    `;
  });

export const reportGuide = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { guideId: string; reason: string }) => ({
    guideId: clean(input?.guideId, 80),
    reason: clean(input?.reason, 240) || "Concern",
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = `${context.userId}:${data.guideId}`.slice(0, 120);
    await sql`
      insert into profile_reports (id, user_id, guide_id, reason)
      values (${id}, ${context.userId}, ${data.guideId}, ${data.reason})
      on conflict (id) do nothing
    `;
    return { ok: true as const };
  });

export const saveCrash = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; message: string; stack: string; fatal: boolean }) => ({
    id: clean(input?.id, 40),
    message: clean(input?.message, 500),
    stack: String(input?.stack ?? "").slice(0, 2000),
    fatal: Boolean(input?.fatal),
  }))
  .handler(async ({ context, data }) => {
    if (!data.id || !data.message) return { ok: false as const };
    const sql = await getSql();
    await sql`
      insert into crash_events (id, user_id, message, stack, fatal)
      values (${data.id}, ${context.userId}, ${data.message}, ${data.stack}, ${data.fatal})
      on conflict (id) do nothing
    `;
    return { ok: true as const };
  });

export const deleteMyData = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const id = context.userId;
    await sql`delete from bookings where user_id = ${id}`;
    await sql`delete from insurance_profiles where user_id = ${id}`;
    await sql`delete from practices where user_id = ${id}`;
    await sql`delete from crash_events where user_id = ${id}`;
    await sql`delete from profile_reports where user_id = ${id}`;
    await sql`delete from call_signals where sender like ${`${id}:%`}`;
    return { ok: true as const };
  });

type SignalInput = {
  room: string;
  tab: string;
  kind: string;
  payload: string;
};

export const postSignal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: SignalInput) => {
    const room = clean(input?.room, 12).toUpperCase();
    if (!/^[A-Z0-9]{4,12}$/.test(room)) throw new Error("Bad room");
    const kind = clean(input?.kind, 16);
    if (!["here", "offer", "answer", "ice", "bye"].includes(kind)) throw new Error("Bad signal");
    return {
      room,
      tab: clean(input?.tab, 16),
      kind,
      payload: String(input?.payload ?? "").slice(0, 20000),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const sender = `${context.userId}:${data.tab}`;
    const rows = await sql<{ id: number }>`
      insert into call_signals (room, sender, kind, payload)
      values (${data.room}, ${sender}, ${data.kind}, ${data.payload})
      returning id
    `;
    return { id: rows[0]?.id ?? 0, sender };
  });

export const pollSignals = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { room: string; since: number }) => ({
    room: clean(input?.room, 12).toUpperCase(),
    since: Math.max(0, Math.round(Number(input?.since) || 0)),
  }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    return sql<SignalRow>`
      select id, room, sender, kind, payload
      from call_signals
      where room = ${data.room} and id > ${data.since}
      order by id asc
      limit 40
    `;
  });

function driveNames(data: unknown) {
  if (!data) return [] as string[];
  const record = data as { files?: unknown[]; items?: unknown[] };
  const list = Array.isArray(data) ? data : (record.files ?? record.items ?? []);
  if (!Array.isArray(list)) return [] as string[];
  return list.slice(0, 12).map((item) => {
    if (!item || typeof item !== "object") return "Untitled";
    const row = item as { name?: string; title?: string };
    return String(row.name || row.title || "Untitled");
  });
}

export type DrivePayload = {
  ok: boolean;
  errorMessage: string | null;
  loginRequired: boolean;
  loginUrl: string | null;
  pending: boolean;
  names: string[];
};

function toDrive(result: {
  ok: boolean;
  errorMessage?: string;
  loginRequired?: boolean;
  loginUrl?: string;
  pending?: boolean;
  data: unknown;
}): DrivePayload {
  return {
    ok: result.ok,
    errorMessage: result.errorMessage ?? null,
    loginRequired: Boolean(result.loginRequired),
    loginUrl: result.loginUrl ?? null,
    pending: Boolean(result.pending),
    names: result.ok ? driveNames(result.data) : [],
  };
}

export const searchDrive = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { q?: string }) => ({
    q: clean(input?.q, 180),
  }))
  .handler(async ({ data }) => {
    const { callTool } = await import("@/lib/app-data/client.server");
    const { ConnectorType, GoogleDriveTools } = await import("@/lib/app-data");
    const result = await callTool(
      GoogleDriveTools.search,
      { q: data.q || "trashed = false", pageSize: 12 },
      { connectorType: ConnectorType.GoogleDrive },
    );
    return toDrive(result);
  });

export const makeDriveFolder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { callTool } = await import("@/lib/app-data/client.server");
    const { ConnectorType, GoogleDriveTools } = await import("@/lib/app-data");
    const result = await callTool(
      GoogleDriveTools.createFolder,
      { name: "ChangeCoin" },
      { connectorType: ConnectorType.GoogleDrive },
    );
    return toDrive(result);
  });
