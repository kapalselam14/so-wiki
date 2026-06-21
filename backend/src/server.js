/*
file: server.js

description:
This is the commencement file. The backend server starts here.
It depends on 2 main components:
  1. app.js : the Fastify application file. Look at the file to see the API construction and error handling.
  2. config/env.js : the configuration file. It reads environment variables and provides them to the app.
*/

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
