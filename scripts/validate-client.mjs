import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  shopSchema,
  themeSchema,
  catalogSchema,
  pagesSchema,
  seoSchema,
  integrationsSchema
} from "@store-platform/config-schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const clientsDir = path.join(rootDir, "clients");

function usage() {
  console.error("Usage: pnpm validate-client <client-id>");
  console.error("Or set CLIENT_ID / STORE_CLIENT_ID env vars.");
  process.exit(1);
}

const [, , clientIdArg] = process.argv;

const clientIdFromEnv = process.env.STORE_CLIENT_ID || process.env.CLIENT_ID;
const clientId = (clientIdArg || clientIdFromEnv || "demo").trim();

if (!clientId) {
  usage();
}

if (!/^[a-z0-9-]+$/.test(clientId)) {
  console.error('Client id must match /^[a-z0-9-]+$/');
  process.exit(1);
}

const clientDir = path.join(clientsDir, clientId);

if (!fs.existsSync(clientDir)) {
  console.error(`Client "${clientId}" not found at ${clientDir}`);
  process.exit(1);
}

function readJson(fileName) {
  const fullPath = path.join(clientDir, fileName);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing required file: ${fileName}`);
  }
  const raw = fs.readFileSync(fullPath, "utf8");
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON in ${fileName}: ${(error && error.message) || String(error)}`);
  }
}

let hasErrors = false;

function validatePart(label, fileName, schema) {
  try {
    const data = readJson(fileName);
    schema.parse(data);
    console.log(`${label} (${fileName}) ✅`);
  } catch (error) {
    hasErrors = true;
    console.error(`${label} (${fileName}) ❌`);
    if (error && error.errors) {
      // Zod error
      for (const issue of error.errors) {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
      }
    } else {
      console.error(`  - ${(error && error.message) || String(error)}`);
    }
  }
}

console.log(`Validating client "${clientId}" in ${clientDir}`);

validatePart("Shop config", "shop.json", shopSchema);
validatePart("Theme config", "theme.json", themeSchema);
validatePart("Catalog config", "catalog.json", catalogSchema);
validatePart("Pages config", "pages.json", pagesSchema);
validatePart("SEO config", "seo.json", seoSchema);
validatePart("Integrations config", "integrations.json", integrationsSchema);

if (hasErrors) {
  console.error("Client config validation failed.");
  process.exit(1);
}

console.log("Client config validation passed.");

