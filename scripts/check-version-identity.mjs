#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const packageVersion = JSON.parse(
  readFileSync(join(REPO_ROOT, "package.json"), "utf8"),
).version;
const changelog = readFileSync(join(REPO_ROOT, "CHANGELOG.md"), "utf8");
const changelogVersion = changelog.match(/^## \[(\d+\.\d+\.\d+)\](?: - .+)?$/m)?.[1];
if (!changelogVersion) throw new Error("CHANGELOG.md has no released head entry");

const constantsUrl = pathToFileURL(join(REPO_ROOT, "dist", "constants.js"));
constantsUrl.searchParams.set("verify", String(Date.now()));
const { SERVER_VERSION } = await import(constantsUrl.href);

const values = {
  "package.json": packageVersion,
  SERVER_VERSION,
  "CHANGELOG head": changelogVersion,
};
if (new Set(Object.values(values)).size !== 1) {
  throw new Error(`Version identity mismatch: ${JSON.stringify(values)}`);
}

console.log(`${packageVersion} matches package.json, SERVER_VERSION, and CHANGELOG head`);
