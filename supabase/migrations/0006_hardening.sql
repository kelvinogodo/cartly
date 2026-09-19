-- Abuse protection for the anonymous write endpoints, plus client error capture.
--
-- The contact form and newsletter box insert straight from the browser with the
-- public key, so anyone can script them. RLS can't express "not too often", so
-- BEFORE INSERT triggers do: they run as the table owner (SECURITY DEFINER),
-- which is also what lets them count rows the anonymous caller cannot read.

-- ---------- shape constraints ----------
alter table public.inquiries
  add constraint inquiries_email_valid check (length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  add constraint inquiries_message_length check (length(btrim(message)) between 1 and 5000),
  add constraint inquiries_name_length check (name is null or length(name) <= 120);

alter table public.newsletter_subscribers
  add constraint newsletter_email_valid check (length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- ---------- rate limits ----------
create or replace function public.limit_inquiry_rate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- one visitor can't flood the inbox...
  if (select count(*) from public.inquiries
      where lower(email) = lower(new.email) and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'rate_limited: too many messages from this address, please try again later' using errcode = 'P0001';
  end if;
  -- ...and neither can a script rotating addresses
  if (select count(*) from public.inquiries where created_at > now() - interval '1 hour') >= 200 then
    raise exception 'rate_limited: we are receiving a lot of messages right now, please try again later' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger inquiries_rate_limit
  before insert on public.inquiries
  for each row execute function public.limit_inquiry_rate();

create or replace function public.limit_newsletter_rate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.newsletter_subscribers where created_at > now() - interval '1 hour') >= 200 then
    raise exception 'rate_limited: too many sign-ups right now, please try again later' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger newsletter_rate_limit
  before insert on public.newsletter_subscribers
  for each row execute function public.limit_newsletter_rate();

-- ---------- client error log ----------
-- Lightweight, dependency-free error monitoring: the browser reports uncaught
-- errors here and admins read them in /admin/errors.
create table public.client_errors (
  id uuid primary key default gen_random_uuid(),
  message text not null check (length(message) between 1 and 2000),
  stack text check (stack is null or length(stack) <= 8000),
  url text check (url is null or length(url) <= 2000),
  user_agent text check (user_agent is null or length(user_agent) <= 500),
  created_at timestamptz not null default now()
);
create index client_errors_created_at_idx on public.client_errors(created_at desc);

alter table public.client_errors enable row level security;
create policy "client_errors_public_insert" on public.client_errors for insert with check (true);
create policy "client_errors_admin_select" on public.client_errors for select using (public.is_admin());
create policy "client_errors_admin_delete" on public.client_errors for delete using (public.is_admin());

-- a crash loop on one page must not fill the table
create or replace function public.limit_client_error_rate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.client_errors where created_at > now() - interval '1 hour') >= 300 then
    return null; -- silently drop: reporting an error must never itself throw
  end if;
  return new;
end;
$$;

create trigger client_errors_rate_limit
  before insert on public.client_errors
  for each row execute function public.limit_client_error_rate();
