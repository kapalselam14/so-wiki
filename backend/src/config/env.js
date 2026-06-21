import "dotenv/config";

export function readEnv(env = process.env) {
  const port = Number.parseInt(env.PORT || "3000", 10);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid TCP port number");
  }

  if (!env.DATABASE_CONNECTION_STRING) {
    throw new Error("Missing DATABASE_CONNECTION_STRING in environment");
  }

  return {
    databaseUrl: env.DATABASE_CONNECTION_STRING,
    host: env.HOST || "127.0.0.1",
    port,
    logLevel: env.LOG_LEVEL || "info",
    logPretty: env.LOG_PRETTY === "true",
    dbSsl: env.DB_SSL === "false" ? false : { rejectUnauthorized: false },
  };
}
