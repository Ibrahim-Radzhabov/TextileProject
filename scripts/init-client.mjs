import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const clientsDir = path.join(rootDir, "clients");

function usage() {
  console.error("Usage: pnpm init-client <new-client-id>");
  process.exit(1);
}

const [, , clientIdArg] = process.argv;

if (!clientIdArg) {
  usage();
}

const newClientId = clientIdArg.trim();

if (!/^[a-z0-9-]+$/.test(newClientId)) {
  console.error('Client id must match /^[a-z0-9-]+$/');
  process.exit(1);
}

const demoDir = path.join(clientsDir, "demo");
const targetDir = path.join(clientsDir, newClientId);

if (!fs.existsSync(demoDir)) {
  console.error(`Demo client not found at ${demoDir}`);
  process.exit(1);
}

if (fs.existsSync(targetDir)) {
  console.error(`Client "${newClientId}" already exists at ${targetDir}`);
  process.exit(1);
}

fs.cpSync(demoDir, targetDir, { recursive: true });

const jsonFiles = [
  "shop.json",
  "theme.json",
  "catalog.json",
  "pages.json",
  "seo.json",
  "integrations.json"
];

for (const file of jsonFiles) {
  const fullPath = path.join(targetDir, file);
  if (!fs.existsSync(fullPath)) continue;
  const raw = fs.readFileSync(fullPath, "utf8");
  const updated = raw.replace(/"demo"/g, `"${newClientId}"`);
  fs.writeFileSync(fullPath, updated, "utf8");
}

console.log(`Client "${newClientId}" created at ${targetDir}`);
console.log(`Set CLIENT_ID=${newClientId} for API and STORE_CLIENT_ID=${newClientId} for web.`);

