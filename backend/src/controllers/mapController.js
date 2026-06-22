export function createMapController(mapService) {
  return {
    async listMaps(request) {
      return mapService.listMaps(request.query);
    },

    async getMap(request){
      return mapService.getMap(request.params.slug);
    }
  };
}
