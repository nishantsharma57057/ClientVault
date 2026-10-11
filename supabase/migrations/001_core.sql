-- ClientVault Phase 1: private single-owner records. Run in Supabase SQL Editor.
-- Provision your admin in Authentication -> Users and enroll an authenticator MFA factor first.
create extension if not exists pgcrypto;
create schema if not exists private;
create table if not exists private.app_admin (
  user_id uuid primary key references auth.users(id) on delete cascade,
  installed_at timestamptz not null default now()
);
revoke all on schema private from anon, authenticated;
revoke all on all tables in schema private from anon, authenticated;
create or replace function public.is_clientvault_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (
  select 1 from private.app_admin a
  where a.user_id = (select auth.uid())
) and coalesce((select auth.jwt()->>'aal'),'') = 'aal2' $$;
revoke all on function public.is_clientvault_admin() from public, anon;
grant execute on function public.is_clientvault_admin() to authenticated;
-- IMPORTANT: after admin provision, run:
-- insert into private.app_admin(user_id) values ('ADMIN_USER_UUID_HERE');
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
  name text not null check (char_length(name) between 1 and 180),
  business text, email text, phone text, domain text,
  created_at timestamptz not null default now()
);
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
  title text not null, client text, status text, deadline date,
  created_at timestamptz not null default now()
);
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
  title text not null, client text, status text, due date,
  created_at timestamptz not null default now()
);
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
  client text, description text, amount numeric(14,2) not null default 0 check(amount>=0),
  received numeric(14,2) not null default 0 check(received>=0),
  created_at timestamptz not null default now(),
  check(received<=amount)
);
create table if not exists public.renewals (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
  client text, service text, provider text, expiry date,
  created_at timestamptz not null default now()
);
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
  client text, title text, content text,
  created_at timestamptz not null default now()
);
do $$ declare t text; begin
 foreach t in array array['clients','projects','tasks','payments','renewals','notes'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('drop policy if exists cv_select on public.%I',t);
  execute format('drop policy if exists cv_insert on public.%I',t);
  execute format('drop policy if exists cv_update on public.%I',t);
  execute format('drop policy if exists cv_delete on public.%I',t);
  execute format('create policy cv_select on public.%I for select to authenticated using (owner_id=(select auth.uid()) and (select public.is_clientvault_admin()))',t);
  execute format('create policy cv_insert on public.%I for insert to authenticated with check (owner_id=(select auth.uid()) and (select public.is_clientvault_admin()))',t);
  execute format('create policy cv_update on public.%I for update to authenticated using (owner_id=(select auth.uid()) and (select public.is_clientvault_admin())) with check (owner_id=(select auth.uid()) and (select public.is_clientvault_admin()))',t);
  execute format('create policy cv_delete on public.%I for delete to authenticated using (owner_id=(select auth.uid()) and (select public.is_clientvault_admin()))',t);
  execute format('create index if not exists %I on public.%I(owner_id,created_at desc)', 'idx_cv_'||t||'_owner', t);
  execute format('revoke all on public.%I from anon',t);
  execute format('grant select,insert,update,delete on public.%I to authenticated',t);
 end loop;
end $$;
-- Prevent owner_id changes even if update credentials are stolen.
create or replace function public.clientvault_immutable_owner()
returns trigger language plpgsql set search_path = '' as $$
begin if new.owner_id is distinct from old.owner_id then raise exception 'owner cannot change'; end if;
return new; end $$;
do $$ declare t text; begin
 foreach t in array array['clients','projects','tasks','payments','renewals','notes'] loop
  execute format('drop trigger if exists cv_owner_immutable on public.%I',t);
  execute format('create trigger cv_owner_immutable before update on public.%I for each row execute function public.clientvault_immutable_owner()',t);
 end loop;
end $$;
