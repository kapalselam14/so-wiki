export function createRepositories(overrides = {}) {
  const monsterRepository = {
    listMonsters: async () => [],
    countMonsters: async () => 0,
    findMonsterBySlug: async () => null,
    findMonsterLocations: async () => [],
    findMonsterDrops: async () => [],
    ...(overrides.monsterRepository || {}),
  };

  const mapRepository = {
    listMaps: async () => [],
    countMaps: async () => 0,
    getMapBySlug: async () => null,
    findMapMonsters: async () => [],
    ...(overrides.mapRepository || {}),
  };

  return {
    monsterRepository,
    mapRepository,
  };
}
