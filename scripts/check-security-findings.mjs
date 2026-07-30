#!/usr/bin/env node
/**
 * CI guard: fails the build if a previously fixed security finding reappears.
 *
 * Baseline: security/baseline.json  (export it from Admin → Security)
 * Current:  security/latest-scan.json (optional; same shape)
 *
 * A finding "reappears" when its internal_id is marked fixed/ignored in the
 * baseline but shows up with status "open" in the latest scan.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const baselinePath = resolve(root, "security/baseline.json");
const latestPath = resolve(root, "security/latest-scan.json");

if (!existsSync(baselinePath)) {
  console.error("✖ security/baseline.json is missing. Export it from Admin → Security.");
  process.exit(1);
}

const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const baseline = read(baselinePath);
const resolved = new Map(
  (baseline.findings || [])
    .filter((f) => f.status === "fixed" || f.status === "ignored")
    .map((f) => [f.internal_id, f])
);

if (!existsSync(latestPath)) {
  console.log(`✔ Baseline loaded (${resolved.size} resolved findings). No latest scan supplied — nothing to compare.`);
  process.exit(0);
}

const latest = read(latestPath);
const regressions = (latest.findings || []).filter(
  (f) => f.status === "open" && resolved.has(f.internal_id)
);
const brandNew = (latest.findings || []).filter(
  (f) => f.status === "open" && !resolved.has(f.internal_id)
);

if (regressions.length) {
  console.error("✖ Previously resolved security findings have reappeared:");
  for (const f of regressions) console.error(`   - [${f.severity}] ${f.internal_id} — ${f.title}`);
}
if (brandNew.length) {
  console.error("✖ New open security findings:");
  for (const f of brandNew) console.error(`   - [${f.severity}] ${f.internal_id} — ${f.title}`);
}

if (regressions.length || brandNew.length) process.exit(1);

console.log(`✔ No open security findings (${resolved.size} remain resolved).`);
