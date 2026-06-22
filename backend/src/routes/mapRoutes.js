import { createMapController } from "../controllers/mapController.js";
import { createMapService } from "../services/mapService.js";
import { listMapsSchema, getMapSchema } from "../schemas/mapSchemas.js";

export async function mapRoutes(fastify) {
  const mapService = createMapService(fastify.repositories.mapRepository);
  const mapController = createMapController(mapService);

  fastify.get("/", { schema: listMapsSchema }, mapController.listMaps);
  fastify.get("/:slug", {schema : getMapSchema}, mapController.getMap)
}
