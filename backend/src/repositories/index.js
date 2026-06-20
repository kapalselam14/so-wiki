import { createMapRepository } from "./mapRepository.js";
import { createMonsterRepository } from "./monsterRepository.js";

export function createRepositories(pool) {
  return {
    mapRepository: createMapRepository(pool),
    monsterRepository: createMonsterRepository(pool),
  };
}
