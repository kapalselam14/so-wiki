import { createMonsterController } from "../controllers/monsterController.js";
import { createMonsterService } from "../services/monsterService.js";
import { getMonsterSchema, listMonstersSchema } from "../schemas/monsterSchemas.js";

export async function monsterRoutes(fastify) {
  const monsterService = createMonsterService(fastify.repositories.monsterRepository);
  const monsterController = createMonsterController(monsterService);

  fastify.get("/", { schema: listMonstersSchema }, monsterController.listMonsters);
  fastify.get("/:slug", { schema: getMonsterSchema }, monsterController.getMonster);
}
