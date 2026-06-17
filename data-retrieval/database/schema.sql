-- Normalized schema with separate drop-domain tables and explicit join tables.
-- This file is destructive by design for clean reinitialization.

create extension if not exists pgcrypto;

drop table if exists monster_drops cascade;
drop table if exists monster_locations cascade;
drop table if exists battle_pet_equipments cascade;
drop table if exists accessories cascade;
drop table if exists armors cascade;
drop table if exists weapons cascade;
drop table if exists pets cascade;
drop table if exists gems cascade;
drop table if exists items cascade;
drop table if exists maps cascade;
drop table if exists monsters cascade;

drop type if exists drop_category cascade;

create type drop_category as enum (
  'items',
  'quest_items',
  'gems',
  'pets',
  'weapons',
  'armors',
  'accessories',
  'b_pet_eq'
);

create table monsters (
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

create table maps (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  image_url text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  image_url text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table gems (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  image_url text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table pets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  image_url text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table weapons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  image_url text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table armors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  image_url text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table accessories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  image_url text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table battle_pet_equipments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  image_url text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table monster_locations (
  monster_id uuid not null references monsters(id) on delete cascade,
  map_id uuid not null references maps(id) on delete cascade,
  source_order integer,
  created_at timestamptz not null default now(),
  primary key (monster_id, map_id)
);

create table monster_drops (
  id uuid primary key default gen_random_uuid(),
  monster_id uuid not null references monsters(id) on delete cascade,
  drop_category drop_category not null,
  item_id uuid references items(id) on delete cascade,
  gem_id uuid references gems(id) on delete cascade,
  pet_id uuid references pets(id) on delete cascade,
  weapon_id uuid references weapons(id) on delete cascade,
  armor_id uuid references armors(id) on delete cascade,
  accessory_id uuid references accessories(id) on delete cascade,
  battle_pet_equipment_id uuid references battle_pet_equipments(id) on delete cascade,
  source_order integer,
  created_at timestamptz not null default now(),
  constraint monster_drops_exactly_one_target check (
    num_nonnulls(
      item_id,
      gem_id,
      pet_id,
      weapon_id,
      armor_id,
      accessory_id,
      battle_pet_equipment_id
    ) = 1
  ),
  constraint monster_drops_category_matches_target check (
    (drop_category in ('items', 'quest_items') and item_id is not null) or
    (drop_category = 'gems' and gem_id is not null) or
    (drop_category = 'pets' and pet_id is not null) or
    (drop_category = 'weapons' and weapon_id is not null) or
    (drop_category = 'armors' and armor_id is not null) or
    (drop_category = 'accessories' and accessory_id is not null) or
    (drop_category = 'b_pet_eq' and battle_pet_equipment_id is not null)
  )
);

create unique index uq_monster_drops_item
on monster_drops(monster_id, drop_category, item_id)
where item_id is not null;

create unique index uq_monster_drops_gem
on monster_drops(monster_id, drop_category, gem_id)
where gem_id is not null;

create unique index uq_monster_drops_pet
on monster_drops(monster_id, drop_category, pet_id)
where pet_id is not null;

create unique index uq_monster_drops_weapon
on monster_drops(monster_id, drop_category, weapon_id)
where weapon_id is not null;

create unique index uq_monster_drops_armor
on monster_drops(monster_id, drop_category, armor_id)
where armor_id is not null;

create unique index uq_monster_drops_accessory
on monster_drops(monster_id, drop_category, accessory_id)
where accessory_id is not null;

create unique index uq_monster_drops_b_pet_eq
on monster_drops(monster_id, drop_category, battle_pet_equipment_id)
where battle_pet_equipment_id is not null;

create index idx_monsters_name on monsters(name);
create index idx_monsters_level on monsters(level);
create index idx_monsters_element on monsters(element);

create index idx_maps_name on maps(name);

create index idx_items_name on items(name);
create index idx_gems_name on gems(name);
create index idx_pets_name on pets(name);
create index idx_weapons_name on weapons(name);
create index idx_armors_name on armors(name);
create index idx_accessories_name on accessories(name);
create index idx_battle_pet_equipments_name on battle_pet_equipments(name);

create index idx_monster_locations_map_id on monster_locations(map_id);
create index idx_monster_drops_monster_id on monster_drops(monster_id);
create index idx_monster_drops_drop_category on monster_drops(drop_category);
create index idx_monster_drops_item_id
on monster_drops(item_id)
where item_id is not null;
create index idx_monster_drops_gem_id
on monster_drops(gem_id)
where gem_id is not null;
create index idx_monster_drops_pet_id
on monster_drops(pet_id)
where pet_id is not null;
create index idx_monster_drops_weapon_id
on monster_drops(weapon_id)
where weapon_id is not null;
create index idx_monster_drops_armor_id
on monster_drops(armor_id)
where armor_id is not null;
create index idx_monster_drops_accessory_id
on monster_drops(accessory_id)
where accessory_id is not null;
create index idx_monster_drops_battle_pet_equipment_id
on monster_drops(battle_pet_equipment_id)
where battle_pet_equipment_id is not null;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_set_monsters_updated_at on monsters;
drop trigger if exists trigger_set_maps_updated_at on maps;
drop trigger if exists trigger_set_items_updated_at on items;
drop trigger if exists trigger_set_gems_updated_at on gems;
drop trigger if exists trigger_set_pets_updated_at on pets;
drop trigger if exists trigger_set_weapons_updated_at on weapons;
drop trigger if exists trigger_set_armors_updated_at on armors;
drop trigger if exists trigger_set_accessories_updated_at on accessories;
drop trigger if exists trigger_set_battle_pet_equipments_updated_at on battle_pet_equipments;

create trigger trigger_set_monsters_updated_at
before update on monsters
for each row
execute function set_updated_at();

create trigger trigger_set_maps_updated_at
before update on maps
for each row
execute function set_updated_at();

create trigger trigger_set_items_updated_at
before update on items
for each row
execute function set_updated_at();

create trigger trigger_set_gems_updated_at
before update on gems
for each row
execute function set_updated_at();

create trigger trigger_set_pets_updated_at
before update on pets
for each row
execute function set_updated_at();

create trigger trigger_set_weapons_updated_at
before update on weapons
for each row
execute function set_updated_at();

create trigger trigger_set_armors_updated_at
before update on armors
for each row
execute function set_updated_at();

create trigger trigger_set_accessories_updated_at
before update on accessories
for each row
execute function set_updated_at();

create trigger trigger_set_battle_pet_equipments_updated_at
before update on battle_pet_equipments
for each row
execute function set_updated_at();

alter table monsters enable row level security;
alter table maps enable row level security;
alter table items enable row level security;
alter table gems enable row level security;
alter table pets enable row level security;
alter table weapons enable row level security;
alter table armors enable row level security;
alter table accessories enable row level security;
alter table battle_pet_equipments enable row level security;
alter table monster_locations enable row level security;
alter table monster_drops enable row level security;

drop policy if exists "Allow public read monsters" on monsters;
drop policy if exists "Allow public read maps" on maps;
drop policy if exists "Allow public read items" on items;
drop policy if exists "Allow public read gems" on gems;
drop policy if exists "Allow public read pets" on pets;
drop policy if exists "Allow public read weapons" on weapons;
drop policy if exists "Allow public read armors" on armors;
drop policy if exists "Allow public read accessories" on accessories;
drop policy if exists "Allow public read battle pet equipments" on battle_pet_equipments;
drop policy if exists "Allow public read monster locations" on monster_locations;
drop policy if exists "Allow public read monster drops" on monster_drops;

create policy "Allow public read monsters"
on monsters for select using (true);

create policy "Allow public read maps"
on maps for select using (true);

create policy "Allow public read items"
on items for select using (true);

create policy "Allow public read gems"
on gems for select using (true);

create policy "Allow public read pets"
on pets for select using (true);

create policy "Allow public read weapons"
on weapons for select using (true);

create policy "Allow public read armors"
on armors for select using (true);

create policy "Allow public read accessories"
on accessories for select using (true);

create policy "Allow public read battle pet equipments"
on battle_pet_equipments for select using (true);

create policy "Allow public read monster locations"
on monster_locations for select using (true);

create policy "Allow public read monster drops"
on monster_drops for select using (true);
