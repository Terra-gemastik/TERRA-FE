/**
 * Regenerate src/api/schema.d.ts from openapi.json.
 *
 *   npm run generate:api
 *
 * openapi.json is the contract, copied from the backend repo. Regenerate it
 * there whenever a request or response shape changes:
 *
 *   cd ../TERRA_GEMASTIK
 *   python -m scripts.export_openapi
 *   cp openapi.json ../TERRA_MOBILE/openapi.json
 *
 * Types are generated FROM THAT FILE, never hand-written from memory. A field
 * renamed in the backend should surface here as a TypeScript error, which is
 * the entire point.
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const input = resolve(root, "openapi.json");
const output = resolve(root, "src/api/schema.d.ts");

if (!existsSync(input)) {
  console.error(`GAGAL: ${input} tidak ditemukan.`);
  console.error("Ekspor dulu dari repo backend (lihat komentar di berkas ini).");
  process.exit(1);
}

console.log(`openapi.json → src/api/schema.d.ts`);
execFileSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["openapi-typescript", input, "-o", output],
  { stdio: "inherit", cwd: root },
);
