create table if not exists practices (
  user_id text primary key,
  display_name text not null,
  licensed boolean not null default false,
  credential_label text not null default '',
  region text not null default '',
  bio text not null default '',
  rate_cents integer not null default 0,
  specialties text not null default '',
  promoted boolean not null default false,
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists insurance_profiles (
  user_id text primary key,
  payer text not null default '',
  plan_name text not null default '',
  member_last4 text not null default '',
  group_number text not null default '',
  holder_name text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists bookings (
  id text primary key,
  user_id text not null,
  guide_id text not null,
  guide_name text not null,
  licensed boolean not null,
  starts_at text not null,
  minutes integer not null,
  amount_cents integer not null,
  pay_method text not null,
  status text not null,
  room_code text not null,
  created_at timestamptz not null default now()
);

create index if not exists bookings_user_idx on bookings (user_id);

create table if not exists crash_events (
  id text primary key,
  user_id text not null,
  message text not null,
  stack text not null default '',
  fatal boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists crash_events_user_idx on crash_events (user_id);

create table if not exists profile_reports (
  id text primary key,
  user_id text not null,
  guide_id text not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists call_signals (
  id serial primary key,
  room text not null,
  sender text not null,
  kind text not null,
  payload text not null,
  created_at timestamptz not null default now()
);

create index if not exists call_signals_room_idx on call_signals (room, id);
