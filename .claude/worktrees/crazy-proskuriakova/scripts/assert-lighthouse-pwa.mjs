#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";

const reportPathArg = process.argv[2];
const minScoreArg = process.argv[3];

if (!reportPathArg) {
  console.error("Usage: node scripts/assert-lighthouse-pwa.mjs <report.json> [minScore]");
  process.exit(1);
}

const reportPath = path.resolve(process.cwd(), reportPathArg);
const minScore = Number.parseFloat(minScoreArg ?? "0.9");

if (!Number.isFinite(minScore) || minScore <= 0 || minScore > 1) {
  console.error(`Invalid minScore "${minScoreArg}". Expected number in range (0, 1].`);
  process.exit(1);
}

const raw = await readFile(reportPath, "utf-8");
const parsed = JSON.parse(raw);
const lhr = Array.isArray(parsed) ? parsed[0] : parsed;

if (!lhr || typeof lhr !== "object") {
  console.error("Invalid Lighthouse report payload.");
  process.exit(1);
}

const pwaCategory = lhr.categories?.pwa;
if (pwaCategory) {
  const score = Number(pwaCategory.score ?? 0);
  if (score < minScore) {
    console.error(`PWA score ${score.toFixed(2)} is below required ${minScore.toFixed(2)}.`);
    process.exit(1);
  }
} else {
  console.warn("Lighthouse report does not include PWA category; falling back to required PWA audits.");
}

const legacyAudits = ["service-worker", "installable-manifest", "offline-start-url"];
const modernAudits = ["installable-manifest", "maskable-icon"];

const hasLegacyAudits = legacyAudits.every((auditId) => Boolean(lhr.audits?.[auditId]));
const requiredAuditIds = hasLegacyAudits ? legacyAudits : modernAudits;
const failedAudits = [];

for (const auditId of requiredAuditIds) {
  const audit = lhr.audits?.[auditId];
  if (!audit) {
    failedAudits.push(`${auditId}:missing`);
    continue;
  }

  const auditScore = Number(audit.score ?? 0);
  if (auditScore < 1) {
    failedAudits.push(`${auditId}:${auditScore}`);
  }
}

if (failedAudits.length > 0) {
  console.error(`Failed required PWA audits: ${failedAudits.join(", ")}`);
  process.exit(1);
}

if (pwaCategory) {
  const score = Number(pwaCategory.score ?? 0);
  console.log(`Lighthouse PWA check passed with score ${score.toFixed(2)}.`);
} else {
  console.log("Lighthouse PWA check passed via required audit checks.");
}
