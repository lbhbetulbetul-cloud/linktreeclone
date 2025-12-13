-- Analytics & engagement: link clicks, profile forms, and submissions

-- LINK CLICKS
create table if not exists public.link_clicks (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.links (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  action text not null default 'buka',
  platform text null,
  referrer text null,
  source text null,
  device_type text null,
  os text null,
  browser text null,
  country text null,
  region text null,
  city text null,
  latitude double precision null,
  longitude double precision null,
  created_at timestamptz not null default now()
);

create index if not exists link_clicks_user_created_at_idx
  on public.link_clicks (user_id, created_at desc);

create index if not exists link_clicks_link_created_at_idx
  on public.link_clicks (link_id, created_at desc);

alter table public.link_clicks enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'link_clicks'
      and policyname = 'link_clicks_select_own'
  ) then
    create policy link_clicks_select_own
      on public.link_clicks
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

create or replace function public.record_link_click(
  p_link_id uuid,
  p_action text default 'buka',
  p_platform text default null,
  p_referrer text default null,
  p_source text default null,
  p_device_type text default null,
  p_os text default null,
  p_browser text default null,
  p_country text default null,
  p_region text default null,
  p_city text default null,
  p_latitude double precision default null,
  p_longitude double precision default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_click_id uuid;
begin
  select user_id into v_user_id
  from public.links
  where id = p_link_id;

  if v_user_id is null then
    raise exception 'Tautan tidak ditemukan';
  end if;

  insert into public.link_clicks (
    link_id,
    user_id,
    action,
    platform,
    referrer,
    source,
    device_type,
    os,
    browser,
    country,
    region,
    city,
    latitude,
    longitude
  )
  values (
    p_link_id,
    v_user_id,
    coalesce(nullif(p_action, ''), 'buka'),
    nullif(p_platform, ''),
    nullif(p_referrer, ''),
    nullif(p_source, ''),
    nullif(p_device_type, ''),
    nullif(p_os, ''),
    nullif(p_browser, ''),
    nullif(p_country, ''),
    nullif(p_region, ''),
    nullif(p_city, ''),
    p_latitude,
    p_longitude
  )
  returning id into v_click_id;

  return v_click_id;
end;
$$;

grant execute on function public.record_link_click(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  double precision,
  double precision
) to anon, authenticated;


-- PROFILE FORMS
create table if not exists public.profile_forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  enabled boolean not null default false,
  title text null,
  description text null,
  fields jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profile_forms enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profile_forms'
      and policyname = 'profile_forms_select_own'
  ) then
    create policy profile_forms_select_own
      on public.profile_forms
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profile_forms'
      and policyname = 'profile_forms_upsert_own'
  ) then
    create policy profile_forms_upsert_own
      on public.profile_forms
      for insert
      to authenticated
      with check (auth.uid() = user_id);

    create policy profile_forms_update_own
      on public.profile_forms
      for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profile_forms'
      and policyname = 'profile_forms_public_read_enabled'
  ) then
    create policy profile_forms_public_read_enabled
      on public.profile_forms
      for select
      to anon, authenticated
      using (enabled = true);
  end if;
end $$;


-- FORM SUBMISSIONS
create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.profile_forms (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  data jsonb not null,
  status text not null default 'baru',
  referrer text null,
  source text null,
  device_type text null,
  os text null,
  browser text null,
  country text null,
  region text null,
  city text null,
  created_at timestamptz not null default now()
);

create index if not exists form_submissions_user_created_at_idx
  on public.form_submissions (user_id, created_at desc);

alter table public.form_submissions enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'form_submissions'
      and policyname = 'form_submissions_select_own'
  ) then
    create policy form_submissions_select_own
      on public.form_submissions
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'form_submissions'
      and policyname = 'form_submissions_update_own'
  ) then
    create policy form_submissions_update_own
      on public.form_submissions
      for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

create or replace function public.submit_profile_form(
  p_form_id uuid,
  p_data jsonb,
  p_referrer text default null,
  p_source text default null,
  p_device_type text default null,
  p_os text default null,
  p_browser text default null,
  p_country text default null,
  p_region text default null,
  p_city text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_enabled boolean;
  v_submission_id uuid;
begin
  select user_id, enabled
    into v_user_id, v_enabled
  from public.profile_forms
  where id = p_form_id;

  if v_user_id is null then
    raise exception 'Formulir tidak ditemukan';
  end if;

  if v_enabled is distinct from true then
    raise exception 'Formulir tidak aktif';
  end if;

  insert into public.form_submissions (
    form_id,
    user_id,
    data,
    status,
    referrer,
    source,
    device_type,
    os,
    browser,
    country,
    region,
    city
  )
  values (
    p_form_id,
    v_user_id,
    p_data,
    'baru',
    nullif(p_referrer, ''),
    nullif(p_source, ''),
    nullif(p_device_type, ''),
    nullif(p_os, ''),
    nullif(p_browser, ''),
    nullif(p_country, ''),
    nullif(p_region, ''),
    nullif(p_city, '')
  )
  returning id into v_submission_id;

  return v_submission_id;
end;
$$;

grant execute on function public.submit_profile_form(
  uuid,
  jsonb,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) to anon, authenticated;
