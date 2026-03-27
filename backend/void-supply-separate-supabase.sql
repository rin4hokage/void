create extension if not exists "pgcrypto";

create table if not exists public.beats (
  id text primary key,
  title text not null,
  bpm integer not null,
  key text not null,
  price numeric not null default 0,
  mood text not null default 'custom upload',
  tags text[] not null default '{}',
  artwork text not null,
  clip_type text not null check (clip_type in ('uploaded', 'generated')),
  snippet_url text,
  created_at timestamptz not null default now()
);

alter table public.beats enable row level security;

create policy "public read beats"
on public.beats
for select
using (true);

create policy "public insert beats"
on public.beats
for insert
with check (true);

insert into storage.buckets (id, name, public)
values ('void-supply-media', 'void-supply-media', true)
on conflict (id) do nothing;

create policy "public read storage"
on storage.objects
for select
using (bucket_id = 'void-supply-media');

create policy "public insert storage"
on storage.objects
for insert
with check (bucket_id = 'void-supply-media');
