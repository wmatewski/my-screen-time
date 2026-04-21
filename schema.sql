create extension if not exists pgcrypto;

create schema if not exists screentime;

do $$
begin
  if not exists (
    select 1
    from pg_type as types
    join pg_namespace as namespaces on namespaces.oid = types.typnamespace
    where namespaces.nspname = 'screentime'
      and types.typname = 'os_family'
  ) then
    create type screentime.os_family as enum (
      'ios',
      'android',
      'windows',
      'macos',
      'linux',
      'unknown'
    );
  else
    alter type screentime.os_family add value if not exists 'ios';
    alter type screentime.os_family add value if not exists 'android';
    alter type screentime.os_family add value if not exists 'windows';
    alter type screentime.os_family add value if not exists 'macos';
    alter type screentime.os_family add value if not exists 'linux';
    alter type screentime.os_family add value if not exists 'unknown';
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type as types
    join pg_namespace as namespaces on namespaces.oid = types.typnamespace
    where namespaces.nspname = 'screentime'
      and types.typname = 'admin_role'
  ) then
    create type screentime.admin_role as enum (
      'owner',
      'admin'
    );
  else
    alter type screentime.admin_role add value if not exists 'owner';
    alter type screentime.admin_role add value if not exists 'admin';
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type as types
    join pg_namespace as namespaces on namespaces.oid = types.typnamespace
    where namespaces.nspname = 'screentime'
      and types.typname = 'admin_status'
  ) then
    create type screentime.admin_status as enum (
      'invited',
      'active',
      'disabled'
    );
  else
    alter type screentime.admin_status add value if not exists 'invited';
    alter type screentime.admin_status add value if not exists 'active';
    alter type screentime.admin_status add value if not exists 'disabled';
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type as types
    join pg_namespace as namespaces on namespaces.oid = types.typnamespace
    where namespaces.nspname = 'screentime'
      and types.typname = 'organization_role'
  ) then
    create type screentime.organization_role as enum (
      'owner',
      'member'
    );
  else
    alter type screentime.organization_role add value if not exists 'owner';
    alter type screentime.organization_role add value if not exists 'member';
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type as types
    join pg_namespace as namespaces on namespaces.oid = types.typnamespace
    where namespaces.nspname = 'screentime'
      and types.typname = 'membership_status'
  ) then
    create type screentime.membership_status as enum (
      'invited',
      'active'
    );
  else
    alter type screentime.membership_status add value if not exists 'invited';
    alter type screentime.membership_status add value if not exists 'active';
  end if;
end
$$;

create table if not exists screentime.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint user_profiles_email_check check (position('@' in email) > 1),
  constraint user_profiles_full_name_check check (char_length(trim(full_name)) >= 2)
);

create table if not exists screentime.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint organizations_name_check check (char_length(trim(name)) >= 2),
  constraint organizations_slug_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists screentime.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references screentime.organizations (id) on delete cascade,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  role screentime.organization_role not null default 'member',
  status screentime.membership_status not null default 'invited',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, user_id)
);

create table if not exists screentime.tracked_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references screentime.organizations (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint tracked_sessions_name_check check (char_length(trim(name)) >= 2),
  constraint tracked_sessions_slug_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists screentime.screen_time_entries (
  id uuid primary key default gen_random_uuid(),
  tracked_session_id uuid references screentime.tracked_sessions (id) on delete cascade,
  session_id uuid not null,
  screen_time_minutes integer not null check (screen_time_minutes between 0 and 1440),
  detected_os screentime.os_family not null default 'unknown',
  ip_address inet,
  user_agent text,
  submitted_at timestamptz not null default timezone('utc', now()),
  entry_date date not null default (timezone('utc', now())::date)
);

create index if not exists screen_time_entries_session_idx
  on screentime.screen_time_entries (tracked_session_id, session_id, submitted_at desc);

create index if not exists screen_time_entries_os_idx
  on screentime.screen_time_entries (detected_os, submitted_at desc);

create index if not exists screen_time_entries_entry_date_idx
  on screentime.screen_time_entries (entry_date desc);

create index if not exists screen_time_entries_ip_idx
  on screentime.screen_time_entries (ip_address);

create index if not exists organization_memberships_org_idx
  on screentime.organization_memberships (organization_id, status, created_at desc);

create index if not exists tracked_sessions_created_by_idx
  on screentime.tracked_sessions (created_by, created_at desc);

create index if not exists tracked_sessions_org_idx
  on screentime.tracked_sessions (organization_id, created_at desc);

create table if not exists screentime.admin_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  role screentime.admin_role not null default 'admin',
  status screentime.admin_status not null default 'invited',
  invited_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint admin_profiles_email_check check (position('@' in email) > 1)
);

create table if not exists screentime.admin_audit_log (
  id bigint generated by default as identity primary key,
  actor_user_id uuid references auth.users (id) on delete set null,
  action text not null,
  target_email text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function screentime.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists user_profiles_set_updated_at on screentime.user_profiles;
create trigger user_profiles_set_updated_at
before update on screentime.user_profiles
for each row
execute function screentime.set_updated_at();

drop trigger if exists organizations_set_updated_at on screentime.organizations;
create trigger organizations_set_updated_at
before update on screentime.organizations
for each row
execute function screentime.set_updated_at();

drop trigger if exists organization_memberships_set_updated_at on screentime.organization_memberships;
create trigger organization_memberships_set_updated_at
before update on screentime.organization_memberships
for each row
execute function screentime.set_updated_at();

drop trigger if exists tracked_sessions_set_updated_at on screentime.tracked_sessions;
create trigger tracked_sessions_set_updated_at
before update on screentime.tracked_sessions
for each row
execute function screentime.set_updated_at();

drop trigger if exists admin_profiles_set_updated_at on screentime.admin_profiles;
create trigger admin_profiles_set_updated_at
before update on screentime.admin_profiles
for each row
execute function screentime.set_updated_at();

create or replace function screentime.is_admin(check_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = screentime, auth, public
as $$
  select exists (
    select 1
    from screentime.admin_profiles
    where user_id = check_user_id
      and status = 'active'
  );
$$;

create or replace function screentime.bootstrap_admin(
  target_email text,
  target_role screentime.admin_role default 'owner'
)
returns uuid
language plpgsql
security definer
set search_path = screentime, auth, public
as $$
declare
  auth_user_id uuid;
begin
  select id
  into auth_user_id
  from auth.users
  where lower(email) = lower(target_email)
  order by created_at desc
  limit 1;

  if auth_user_id is null then
    raise exception 'Auth user with email % does not exist. Create it in Supabase Auth first.', target_email;
  end if;

  insert into screentime.admin_profiles (user_id, email, role, status)
  values (auth_user_id, lower(target_email), target_role, 'active')
  on conflict (user_id) do update
    set email = excluded.email,
        role = excluded.role,
        status = 'active',
        updated_at = timezone('utc', now());

  insert into screentime.admin_audit_log (actor_user_id, action, target_email, metadata)
  values (
    auth_user_id,
    'bootstrap_admin',
    lower(target_email),
    jsonb_build_object('role', target_role)
  );

  return auth_user_id;
end;
$$;

create or replace view screentime.latest_session_entries as
select distinct on (tracked_session_id, session_id)
  id,
  tracked_session_id,
  session_id,
  screen_time_minutes,
  detected_os,
  ip_address,
  user_agent,
  submitted_at,
  entry_date
from screentime.screen_time_entries
order by tracked_session_id, session_id, submitted_at desc;

create or replace view screentime.os_statistics as
select
  detected_os,
  count(*)::integer as participants,
  round(avg(screen_time_minutes)::numeric, 1) as average_minutes,
  min(screen_time_minutes)::integer as minimum_minutes,
  max(screen_time_minutes)::integer as maximum_minutes
from screentime.latest_session_entries
group by detected_os;

create or replace view screentime.ip_statistics as
select
  coalesce(host(ip_address), 'unknown') as ip_address,
  count(*)::integer as submissions,
  max(submitted_at) as last_seen,
  round(avg(screen_time_minutes)::numeric, 1) as average_minutes
from screentime.screen_time_entries
group by coalesce(host(ip_address), 'unknown');

create or replace view screentime.session_statistics as
select
  sessions.id,
  sessions.organization_id,
  sessions.created_by,
  sessions.name,
  sessions.slug,
  sessions.description,
  sessions.created_at,
  sessions.updated_at,
  count(entries.id)::integer as submissions,
  round(avg(entries.screen_time_minutes)::numeric, 1) as average_minutes,
  max(entries.submitted_at) as last_submission_at
from screentime.tracked_sessions as sessions
left join screentime.screen_time_entries as entries
  on entries.tracked_session_id = sessions.id
group by
  sessions.id,
  sessions.organization_id,
  sessions.created_by,
  sessions.name,
  sessions.slug,
  sessions.description,
  sessions.created_at,
  sessions.updated_at;

grant usage on schema screentime to anon, authenticated, service_role;
grant select on screentime.user_profiles, screentime.organizations, screentime.organization_memberships, screentime.tracked_sessions, screentime.admin_profiles to authenticated, service_role;
grant select, insert, update, delete on all tables in schema screentime to service_role;
grant usage on all sequences in schema screentime to service_role;
grant select on screentime.latest_session_entries, screentime.os_statistics, screentime.ip_statistics, screentime.session_statistics to authenticated, service_role;
grant execute on function screentime.is_admin(uuid) to authenticated, service_role;
grant execute on function screentime.bootstrap_admin(text, screentime.admin_role) to service_role;

alter table screentime.user_profiles enable row level security;
alter table screentime.organizations enable row level security;
alter table screentime.organization_memberships enable row level security;
alter table screentime.tracked_sessions enable row level security;
alter table screentime.screen_time_entries enable row level security;
alter table screentime.admin_profiles enable row level security;
alter table screentime.admin_audit_log enable row level security;

drop policy if exists user_profiles_self_select on screentime.user_profiles;
create policy user_profiles_self_select
on screentime.user_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists user_profiles_self_update on screentime.user_profiles;
create policy user_profiles_self_update
on screentime.user_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists organizations_member_select on screentime.organizations;
create policy organizations_member_select
on screentime.organizations
for select
to authenticated
using (
  exists (
    select 1
    from screentime.organization_memberships
    where organization_id = organizations.id
      and user_id = auth.uid()
  )
);

drop policy if exists organization_memberships_same_org_select on screentime.organization_memberships;
create policy organization_memberships_same_org_select
on screentime.organization_memberships
for select
to authenticated
using (
  exists (
    select 1
    from screentime.organization_memberships as memberships
    where memberships.organization_id = organization_memberships.organization_id
      and memberships.user_id = auth.uid()
      and memberships.status = 'active'
  )
);

drop policy if exists tracked_sessions_same_org_select on screentime.tracked_sessions;
create policy tracked_sessions_same_org_select
on screentime.tracked_sessions
for select
to authenticated
using (
  exists (
    select 1
    from screentime.organization_memberships
    where organization_id = tracked_sessions.organization_id
      and user_id = auth.uid()
      and status = 'active'
  )
);

drop policy if exists admin_profiles_self_select on screentime.admin_profiles;
create policy admin_profiles_self_select
on screentime.admin_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists admin_profiles_self_update on screentime.admin_profiles;
create policy admin_profiles_self_update
on screentime.admin_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
