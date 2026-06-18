/**
 * Validates environment schema for CI and local preflight checks.
 *
 * Usage: bun scripts/verify-env-schema.ts
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import {
  OPTIONAL_ENV_VARS,
  REQUIRED_ENV_VARS,
  validateEnvironmentSchema,
} from "../src/server/config/env-schema";

const ROOT = process.cwd();

async function verifyEnvExample(): Promise<void> {
  const envExamplePath = join(ROOT, ".env.example");
  const contents = await readFile(envExamplePath, "utf8");
  const documentedKeys = new Set(
    contents
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => line.split("=")[0]?.trim())
      .filter((key): key is string => Boolean(key)),
  );

  const missingRequired = REQUIRED_ENV_VARS.filter((key) => !documentedKeys.has(key));
  if (missingRequired.length > 0) {
    throw new Error(`.env.example is missing required keys: ${missingRequired.join(", ")}`);
  }

  const missingOptional = OPTIONAL_ENV_VARS.filter((key) => !documentedKeys.has(key));
  if (missingOptional.length > 0) {
    throw new Error(`.env.example is missing optional keys: ${missingOptional.join(", ")}`);
  }
}

async function main(): Promise<void> {
  console.info("[verify-env] Checking .env.example completeness...");
  await verifyEnvExample();

  console.info("[verify-env] Validating environment schema rules...");
  validateEnvironmentSchema();

  console.info("[verify-env] Environment schema verification passed.");
}

main().catch((error) => {
  console.error("[verify-env] Verification failed:", error);
  process.exit(1);
});
