import { supabase } from "../config/supabase.js";

export async function upsertMonster(monster) {
  const { data, error } = await supabase
    .from("monsters")
    .upsert(
      {
        slug: monster.slug,
        name: monster.name,
        level_range: monster.levelRange,
        level: monster.level,
        attribute: monster.attribute,
        weapons: monster.weapons,
        armor: monster.armor,
        accessories: monster.accessories,
        battle_pet_equipment: monster.battlePetEquipment,
        quest_items: monster.questItems,
        raw_text: monster.rawText,
        related_links: monster.relatedLinks,
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

export async function replaceMonsterDrops(monsterId, drops) {
  const { error: deleteError } = await supabase
    .from("monster_drops")
    .delete()
    .eq("monster_id", monsterId);

  if (deleteError) {
    throw deleteError;
  }

  if (!drops || drops.length === 0) {
    return;
  }

  const rows = drops.map((itemName) => ({
    monster_id: monsterId,
    item_name: itemName,
  }));

  const { error: insertError } = await supabase
    .from("monster_drops")
    .insert(rows);

  if (insertError) {
    throw insertError;
  }
}

export async function saveMonsterWithDrops(monster) {
  const savedMonster = await upsertMonster(monster);
  await replaceMonsterDrops(savedMonster.id, monster.drops);

  return savedMonster;
}