-- Fresh normalized schema for Seal Online monster data.
-- This file is the SQL counterpart to database/schema.json.
-- It is a source-of-truth schema definition, not a backwards-compatible migration.

create extension if not exists pgcrypto;

drop table if exists monster_drops cascade;
drop table if exists monster_locations cascade;
drop table if exists items cascade;
drop table if exists locations cascade;
drop table if exists monsters cascade;

drop type if exists drop_category cascade;
drop type if exists item_type cascade;

create type drop_category as enum (
  'gems',
  'items',
  'weapons',
  'armors',
  'accessories',
  'b_pet_eq',
  'pets',
  'quest_items'
);

create type item_type as enum (
  'gem',
  'item',
  'weapon',
  'armor',
  'accessory',
  'b_pet_eq',
  'pet',
  'quest_item',
  'unknown'
);

create table if not exists monsters (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  level integer,
  element text,
  image_url text,
  source_page text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  item_type item_type not null,
  image_url text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists monster_locations (
  monster_id uuid not null references monsters(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  source_order integer,
  created_at timestamptz not null default now(),
  primary key (monster_id, location_id)
);

create table if not exists monster_drops (
  id uuid primary key default gen_random_uuid(),
  monster_id uuid not null references monsters(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade,
  drop_category drop_category not null,
  source_order integer,
  created_at timestamptz not null default now(),
  unique (monster_id, item_id, drop_category)
);

create index if not exists idx_monsters_name
on monsters(name);

create index if not exists idx_monsters_level
on monsters(level);

create index if not exists idx_monsters_element
on monsters(element);

create index if not exists idx_locations_name
on locations(name);

create index if not exists idx_items_name
on items(name);

create index if not exists idx_items_item_type
on items(item_type);

create index if not exists idx_monster_locations_location_id
on monster_locations(location_id);

create index if not exists idx_monster_drops_monster_id
on monster_drops(monster_id);

create index if not exists idx_monster_drops_item_id
on monster_drops(item_id);

create index if not exists idx_monster_drops_drop_category
on monster_drops(drop_category);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_set_monsters_updated_at on monsters;
drop trigger if exists trigger_set_locations_updated_at on locations;
drop trigger if exists trigger_set_items_updated_at on items;

create trigger trigger_set_monsters_updated_at
before update on monsters
for each row
execute function set_updated_at();

create trigger trigger_set_locations_updated_at
before update on locations
for each row
execute function set_updated_at();

create trigger trigger_set_items_updated_at
before update on items
for each row
execute function set_updated_at();

alter table monsters enable row level security;
alter table locations enable row level security;
alter table items enable row level security;
alter table monster_locations enable row level security;
alter table monster_drops enable row level security;

drop policy if exists "Allow public read monsters" on monsters;
drop policy if exists "Allow public read locations" on locations;
drop policy if exists "Allow public read items" on items;
drop policy if exists "Allow public read monster locations" on monster_locations;
drop policy if exists "Allow public read monster drops" on monster_drops;

create policy "Allow public read monsters"
on monsters
for select
using (true);

create policy "Allow public read locations"
on locations
for select
using (true);

create policy "Allow public read items"
on items
for select
using (true);

create policy "Allow public read monster locations"
on monster_locations
for select
using (true);

create policy "Allow public read monster drops"
on monster_drops
for select
using (true);
