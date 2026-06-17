import { supabase } from "../config/supabase.js";

const DROP_CATEGORY_TO_ITEM_TYPE = {
  gems: "gem",
  items: "item",
  weapons: "weapon",
  armors: "armor",
  accessories: "accessory",
  bPetEq: "b_pet_eq",
  pets: "pet",
  questItems: "quest_item",
};

const DROP_CATEGORY_TO_DB_VALUE = {
  gems: "gems",
  items: "items",
  weapons: "weapons",
  armors: "armors",
  accessories: "accessories",
  bPetEq: "b_pet_eq",
  pets: "pets",
  questItems: "quest_items",
};

async function upsertMonster(monster) {
  const { data, error } = await supabase
    .from("monsters")
    .upsert(
      {
        slug: monster.slug,
        name: monster.name,
        level: monster.level,
        element: monster.element,
        image_url: monster.imageUrl,
        source_page: monster.sourcePage,
        source_url: monster.sourceUrl,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "slug",
      }
    )
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function upsertLocation(location) {
  const { data, error } = await supabase
    .from("locations")
    .upsert(
      {
        slug: location.slug,
        name: location.name,
        source_url: location.sourceUrl,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "slug",
      }
    )
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function upsertItem(item, itemType) {
  const { data, error } = await supabase
    .from("items")
    .upsert(
      {
        slug: item.slug,
        name: item.name,
        item_type: itemType,
        source_url: item.sourceUrl,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "slug",
      }
    )
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function replaceMonsterLocations(monsterId, locations) {
  const { error: deleteError } = await supabase
    .from("monster_locations")
    .delete()
    .eq("monster_id", monsterId);

  if (deleteError) {
    throw deleteError;
  }

  if (!locations?.length) {
    return;
  }

  const locationRows = [];

  for (const [index, location] of locations.entries()) {
    const savedLocation = await upsertLocation(location);
    locationRows.push({
      monster_id: monsterId,
      location_id: savedLocation.id,
      source_order: index,
    });
  }

  const { error: insertError } = await supabase
    .from("monster_locations")
    .insert(locationRows);

  if (insertError) {
    throw insertError;
  }
}

async function replaceMonsterDrops(monsterId, drops) {
  const { error: deleteError } = await supabase
    .from("monster_drops")
    .delete()
    .eq("monster_id", monsterId);

  if (deleteError) {
    throw deleteError;
  }

  const dropRows = [];

  for (const [dropKey, items] of Object.entries(drops || {})) {
    if (!items?.length) continue;

    const itemType = DROP_CATEGORY_TO_ITEM_TYPE[dropKey] ?? "unknown";
    const dropCategory = DROP_CATEGORY_TO_DB_VALUE[dropKey];

    if (!dropCategory) continue;

    for (const [index, item] of items.entries()) {
      const savedItem = await upsertItem(item, itemType);

      dropRows.push({
        monster_id: monsterId,
        item_id: savedItem.id,
        drop_category: dropCategory,
        source_order: index,
      });
    }
  }

  if (!dropRows.length) {
    return;
  }

  const uniqueDropRows = dropRows.filter((row, index, rows) => {
    return (
      rows.findIndex(
        (candidate) =>
          candidate.monster_id === row.monster_id &&
          candidate.item_id === row.item_id &&
          candidate.drop_category === row.drop_category
      ) === index
    );
  });

  const { error: insertError } = await supabase
    .from("monster_drops")
    .insert(uniqueDropRows);

  if (insertError) {
    throw insertError;
  }
}

export async function saveMonster(monster) {
  const savedMonster = await upsertMonster(monster);
  await replaceMonsterLocations(savedMonster.id, monster.foundAt);
  await replaceMonsterDrops(savedMonster.id, monster.drops);

  return savedMonster;
}
