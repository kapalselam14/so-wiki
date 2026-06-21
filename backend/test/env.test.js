import { describe, expect, it } from "vitest";
import { readEnv } from "../src/config/env.js";

const requiredEnv = {
  DATABASE_CONNECTION_STRING: "postgresql://user:password@localhost:5432/seal_wiki",
};

describe("readEnv", () => {
  it("defaults to JSON logging", () => {
    const config = readEnv(requiredEnv);

    expect(config.logLevel).toBe("info");
    expect(config.logPretty).toBe(false);
  });

  it("enables pretty logging only when LOG_PRETTY is true", () => {
    const config = readEnv({
      ...requiredEnv,
      LOG_LEVEL: "debug",
      LOG_PRETTY: "true",
    });

    expect(config.logLevel).toBe("debug");
    expect(config.logPretty).toBe(true);
  });
});
