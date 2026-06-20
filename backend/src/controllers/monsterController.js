export function createMonsterController(monsterService) {
  return {
    async listMonsters(request) {
      return monsterService.listMonsters(request.query);
    },

    async getMonster(request) {
      return monsterService.getMonster(request.params.slug);
    },
  };
}
