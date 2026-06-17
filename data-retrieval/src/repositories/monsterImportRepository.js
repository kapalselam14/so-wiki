import { supabase } from "../config/supabase.js";

const DROP_CONFIG = {
  items: {
    table: "items",
    foreignKey: "item_id",
    dropCategory: "items",
  },
  questItems: {
    table: "items",
    foreignKey: "item_id",
    dropCategory: "quest_items",
  },
  gems: {
    table: "gems",
    foreignKey: "gem_id",
    dropCategory: "gems",
  },
  pets: {
    table: "pets",
    foreignKey: "pet_id",
    dropCategory: "pets",
  },
  weapons: {
    table: "weapons",
    foreignKey: "weapon_id",
    dropCategory: "weapons",
  },
  armors: {
    table: "armors",
    foreignKey: "armor_id",
    dropCategory: "armors",
  },
  accessories: {
    table: "accessories",
    foreignKey: "accessory_id",
    dropCategory: "accessories",
  },
  bPetEq: {
    table: "battle_pet_equipments",
    foreignKey: "battle_pet_equipment_id",
    dropCategory: "b_pet_eq",
  },
};

function currentTimestamp() {
  return new Date().toISOString();
}

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
        updated_at: currentTimestamp(),
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

async function upsertEntity(table, entity) {
  const { data, error } = await supabase
    .from(table)
    .upsert(
      {
        slug: entity.slug,
        name: entity.name,
        image_url: entity.imageUrl,
        source_url: entity.sourceUrl,
        updated_at: currentTimestamp(),
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
    const savedMap = await upsertEntity("maps", location);

    locationRows.push({
      monster_id: monsterId,
      map_id: savedMap.id,
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

function dedupeDropRows(rows) {
  return rows.filter((row, index, candidates) => {
    const targetKey = Object.entries(row).find(
      ([key, value]) => key.endsWith("_id") && key !== "monster_id" && value
    );

    if (!targetKey) {
      return false;
    }

    const [foreignKey, foreignId] = targetKey;

    return (
      candidates.findIndex((candidate) => {
        return (
          candidate.monster_id === row.monster_id &&
          candidate.drop_category === row.drop_category &&
          candidate[foreignKey] === foreignId
        );
      }) === index
    );
  });
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

  for (const [dropKey, entities] of Object.entries(drops || {})) {
    const config = DROP_CONFIG[dropKey];

    if (!config || !entities?.length) {
      continue;
    }

    for (const [index, entity] of entities.entries()) {
      const savedEntity = await upsertEntity(config.table, entity);

      dropRows.push({
        monster_id: monsterId,
        drop_category: config.dropCategory,
        [config.foreignKey]: savedEntity.id,
        source_order: index,
      });
    }
  }

  const uniqueDropRows = dedupeDropRows(dropRows);

  if (!uniqueDropRows.length) {
    return;
  }

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
