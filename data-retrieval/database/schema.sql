create extension if not exists pgcrypto;

create table if not exists monsters (
  id uuid primary key default gen_random_uuid(),

  slug text not null unique,
  name text not null,

  level_range text,
  level integer,
  attribute text,

  weapons text,
  armor text,
  accessories text,
  battle_pet_equipment text,
  quest_items text,

  raw_text text,
  related_links jsonb not null default '[]'::jsonb,

  source_page text,
  source_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists monster_drops (
  id uuid primary key default gen_random_uuid(),

  monster_id uuid not null references monsters(id) on delete cascade,
  item_name text not null,

  created_at timestamptz not null default now(),

  unique(monster_id, item_name)
);

create index if not exists idx_monsters_slug
on monsters(slug);

create index if not exists idx_monsters_name
on monsters(name);

create index if not exists idx_monsters_level
on monsters(level);

create index if not exists idx_monsters_attribute
on monsters(attribute);

create index if not exists idx_monster_drops_monster_id
on monster_drops(monster_id);

create index if not exists idx_monster_drops_item_name
on monster_drops(item_name);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_set_monsters_updated_at on monsters;

create trigger trigger_set_monsters_updated_at
before update on monsters
for each row
execute function set_updated_at();

alter table monsters enable row level security;
alter table monster_drops enable row level security;

drop policy if exists "Allow public read monsters" on monsters;
drop policy if exists "Allow public read monster drops" on monster_drops;

create policy "Allow public read monsters"
on monsters
for select
using (true);

create policy "Allow public read monster drops"
on monster_drops
for select
using (true);