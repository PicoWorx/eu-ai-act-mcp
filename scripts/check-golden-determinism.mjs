#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { registerAssessSystemTool } from "../dist/tools/assess-system.js";
import { canonicalResponseHash } from "../dist/utils/canonical-json.js";

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const FIXTURE_ROOT = join(REPO_ROOT, "tests", "fixtures", "assess-system");
const GOLDEN_ROOT = join(REPO_ROOT, "tests", "golden");
const RUNS_PER_PROFILE = 10;

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

let handler;
registerAssessSystemTool({
  registerTool(name, _metadata, candidate) {
    if (name === "euaiact_assess_system") handler = candidate;
  },
});
if (!handler) throw new Error("euaiact_assess_system did not register a handler");

const index = readJson(join(FIXTURE_ROOT, "fixture-index.json"));
const expectedByCase = new Map(
  readJson(join(GOLDEN_ROOT, "hashes.json")).goldens
    .map((entry) => [entry.case_id, entry.canonical_sha256]),
);
if (index.cases.length !== 12 || expectedByCase.size !== 12) {
  throw new Error("The determinism gate requires exactly 12 golden profiles");
}

let checked = 0;
for (const fixture of index.cases) {
  const profile = readJson(join(FIXTURE_ROOT, fixture.profile));
  const expected = expectedByCase.get(fixture.case_id);
  if (!expected) throw new Error(`Missing pinned hash for ${fixture.case_id}`);
  const hashes = [];
  for (let run = 0; run < RUNS_PER_PROFILE; run += 1) {
    const response = await handler(profile);
    const hash = canonicalResponseHash(response.structuredContent);
    hashes.push(hash);
    checked += 1;
    if (hash !== expected) {
      throw new Error(`${fixture.case_id} run ${run + 1} produced ${hash}, expected ${expected}`);
    }
  }
  if (new Set(hashes).size !== 1) {
    throw new Error(`${fixture.case_id} did not produce one canonical hash across ten runs`);
  }
}

console.log(`12 profiles x 10 runs; ${checked} canonical hashes matched`);
