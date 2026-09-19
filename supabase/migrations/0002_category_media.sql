-- Categories get an explicit display order and a cover photo (used by the
-- storefront's category tiles), instead of being alphabetised and imageless.
alter table public.categories
  add column if not exists sort_order integer not null default 0,
  add column if not exists image_path text;
