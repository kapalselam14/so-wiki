export function createMapController(mapService) {
  return {
    async listMaps(request) {
      return mapService.listMaps(request.query);
    },
  };
}
