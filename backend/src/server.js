import { buildApp } from "./app.js";
import { readEnv } from "./config/env.js";

async function main() {
  const config = readEnv();
  const app = await buildApp({ config });

  try {
    await app.listen({
      host: config.host,
      port: config.port,
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

main();
