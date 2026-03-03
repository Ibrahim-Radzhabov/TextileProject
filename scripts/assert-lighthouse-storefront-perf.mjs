#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function readUsageAndExit() {
  console.error(
    "Usage: node scripts/assert-lighthouse-storefront-perf.mjs <budgets.json> <summary.json> <route>=<report.json> [<route>=<report.json> ...]"
  );
  process.exit(1);
}

function readJsonReport(rawPayload) {
  const parsed = JSON.parse(rawPayload);
  return Array.isArray(parsed) ? parsed[0] : parsed;
}

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : Number.NaN;
}

function formatMetric(value, digits = 2) {
  if (!Number.isFinite(value)) {
    return "n/a";
  }
  return value.toFixed(digits);
}

function formatMetricWithUnit(value, unit, digits = 2) {
  const formatted = formatMetric(value, digits);
  return formatted === "n/a" ? formatted : `${formatted}${unit}`;
}

const [budgetsPathArg, summaryPathArg, ...targets] = process.argv.slice(2);

if (!budgetsPathArg || !summaryPathArg || targets.length === 0) {
  readUsageAndExit();
}

const budgetsPath = path.resolve(process.cwd(), budgetsPathArg);
const summaryPath = path.resolve(process.cwd(), summaryPathArg);

const budgetsRaw = await readFile(budgetsPath, "utf-8");
const budgets = JSON.parse(budgetsRaw);
const defaults = budgets.defaults ?? {};
const routeBudgets = budgets.routes ?? {};

const entries = [];
let hasFailures = false;

for (const target of targets) {
  const separatorIndex = target.indexOf("=");
  if (separatorIndex <= 0 || separatorIndex === target.length - 1) {
    console.error(`Invalid target "${target}". Expected <route>=<reportPath>.`);
    process.exit(1);
  }

  const route = target.slice(0, separatorIndex);
  const reportPath = path.resolve(process.cwd(), target.slice(separatorIndex + 1));
  const reportRaw = await readFile(reportPath, "utf-8");
  const lhr = readJsonReport(reportRaw);

  if (!lhr || typeof lhr !== "object") {
    console.error(`Invalid Lighthouse payload for route "${route}" in ${reportPath}.`);
    process.exit(1);
  }

  const budget = {
    ...defaults,
    ...(routeBudgets[route] ?? {})
  };

  const performanceScore = toNumber(lhr.categories?.performance?.score ?? 0);
  const lcpMs = toNumber(lhr.audits?.["largest-contentful-paint"]?.numericValue);
  const cls = toNumber(lhr.audits?.["cumulative-layout-shift"]?.numericValue);
  const inpMs = toNumber(
    lhr.audits?.["interaction-to-next-paint"]?.numericValue ??
      lhr.audits?.["experimental-interaction-to-next-paint"]?.numericValue
  );

  const checks = [];
  const warnings = [];

  const minPerformanceScore = toNumber(budget.minPerformanceScore);
  const maxLcpMs = toNumber(budget.maxLcpMs);
  const maxCls = toNumber(budget.maxCls);
  const maxInpMs = toNumber(budget.maxInpMs);

  if (Number.isFinite(minPerformanceScore)) {
    checks.push({
      key: "performanceScore",
      pass: performanceScore >= minPerformanceScore,
      actual: performanceScore,
      threshold: minPerformanceScore
    });
  }

  if (Number.isFinite(maxLcpMs)) {
    checks.push({
      key: "lcpMs",
      pass: Number.isFinite(lcpMs) && lcpMs <= maxLcpMs,
      actual: lcpMs,
      threshold: maxLcpMs
    });
  }

  if (Number.isFinite(maxCls)) {
    checks.push({
      key: "cls",
      pass: Number.isFinite(cls) && cls <= maxCls,
      actual: cls,
      threshold: maxCls
    });
  }

  if (Number.isFinite(maxInpMs)) {
    if (Number.isFinite(inpMs)) {
      checks.push({
        key: "inpMs",
        pass: inpMs <= maxInpMs,
        actual: inpMs,
        threshold: maxInpMs
      });
    } else {
      warnings.push("INP audit is unavailable in this report, skipped threshold check.");
    }
  }

  const failedChecks = checks.filter((check) => !check.pass);
  const routePassed = failedChecks.length === 0;
  if (!routePassed) {
    hasFailures = true;
  }

  entries.push({
    route,
    reportPath,
    budget,
    metrics: {
      performanceScore,
      lcpMs,
      cls,
      inpMs
    },
    checks,
    warnings,
    passed: routePassed
  });
}

for (const entry of entries) {
  const status = entry.passed ? "PASS" : "FAIL";
  const metrics = entry.metrics;
  console.log(
    `[perf][${status}] ${entry.route} score=${formatMetric(metrics.performanceScore, 3)} lcp=${formatMetricWithUnit(metrics.lcpMs, "ms", 0)} cls=${formatMetric(metrics.cls, 3)} inp=${formatMetricWithUnit(metrics.inpMs, "ms", 0)}`
  );
  for (const warning of entry.warnings) {
    console.log(`[perf][warn] ${entry.route} ${warning}`);
  }
  for (const failedCheck of entry.checks.filter((check) => !check.pass)) {
    const actual = formatMetric(
      failedCheck.actual,
      failedCheck.key === "performanceScore" || failedCheck.key === "cls" ? 3 : 0
    );
    const threshold = formatMetric(
      failedCheck.threshold,
      failedCheck.key === "performanceScore" || failedCheck.key === "cls" ? 3 : 0
    );
    const comparator = failedCheck.key === "performanceScore" ? ">=" : "<=";
    console.log(
      `[perf][fail] ${entry.route} ${failedCheck.key}: actual ${actual}, expected ${comparator} ${threshold}`
    );
  }
}

await writeFile(
  summaryPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      budgetsPath,
      entries
    },
    null,
    2
  )}\n`,
  "utf-8"
);

if (hasFailures) {
  process.exit(1);
}
