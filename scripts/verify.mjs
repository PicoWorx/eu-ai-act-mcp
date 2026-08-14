#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = dirname(SCRIPT_DIR);
const NPM = process.platform === "win32" ? "npm.cmd" : "npm";
const MAX_BUFFER = 64 * 1024 * 1024;

function parseArguments(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--evidence-dir") {
      const value = argv[index + 1];
      if (!value) throw new Error("--evidence-dir requires a path");
      options.evidenceDir = resolve(value);
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }
  return options;
}

function assertGeneratedPath(target, parent, expectedName) {
  if (dirname(target) !== parent || basename(target) !== expectedName) {
    throw new Error(`Refusing to remove unexpected generated path: ${target}`);
  }
  if (existsSync(target) && lstatSync(target).isSymbolicLink()) {
    throw new Error(`Refusing to remove generated symlink: ${target}`);
  }
}

function removeGeneratedDirectory(target, parent, expectedName) {
  assertGeneratedPath(target, parent, expectedName);
  if (existsSync(target)) rmSync(target, { recursive: true, force: false });
}

function commandOutput(result) {
  return [result.stdout, result.stderr]
    .filter((value) => value && value.trim().length > 0)
    .join("\n")
    .trim();
}

function runCommand(command, args, context) {
  const result = spawnSync(command, args, {
    cwd: context.cwd ?? REPO_ROOT,
    env: context.env,
    encoding: "utf8",
    maxBuffer: MAX_BUFFER,
    windowsHide: true,
  });
  const output = commandOutput(result);
  if (result.error) {
    const error = new Error(result.error.message);
    error.gateOutput = output;
    throw error;
  }
  if (result.status !== 0) {
    const error = new Error(`${command} ${args.join(" ")} exited with status ${result.status}`);
    error.gateOutput = output;
    throw error;
  }
  return output;
}

function matchDetail(output, pattern, fallback) {
  const match = output.match(pattern);
  return match ? match.slice(1).join("/") : fallback;
}

function cleanBuild(context) {
  const dist = join(REPO_ROOT, "dist");
  removeGeneratedDirectory(dist, REPO_ROOT, "dist");
  const output = runCommand(NPM, ["run", "--silent", "build"], context);
  return {
    output: [`Removed ${dist}`, output].filter(Boolean).join("\n"),
    detail: "fresh dist generated",
  };
}

function commandGate(command, args, detail) {
  return (context) => {
    const output = runCommand(command, args, context);
    return {
      output,
      detail: typeof detail === "function" ? detail(output) : detail,
    };
  };
}

function printSummary(results) {
  const headers = ["Gate", "Status", "Detail"];
  const rows = results.map((result) => [result.name, result.status, result.detail]);
  const widths = headers.map((header, column) =>
    Math.max(header.length, ...rows.map((row) => row[column].length)),
  );
  const format = (row) => row
    .map((value, column) => value.padEnd(widths[column]))
    .join(" | ");
  const divider = widths.map((width) => "-".repeat(width)).join("-+-");
  console.log("Verification summary");
  console.log(format(headers));
  console.log(divider);
  for (const row of rows) console.log(format(row));
}

const options = parseArguments(process.argv.slice(2));
if (options.evidenceDir) mkdirSync(options.evidenceDir, { recursive: true });

const npmCache = mkdtempSync(join(tmpdir(), "lexbeam-verify-npm-cache-"));
const context = {
  env: {
    ...process.env,
    npm_config_cache: npmCache,
  },
};

const gates = [
  {
    id: "01-clean-build",
    name: "Clean build",
    run: cleanBuild,
  },
  {
    id: "02-behavior",
    name: "Behavior suite",
    run: commandGate(process.execPath, ["test.mjs"], (output) =>
      matchDetail(output, /RESULTS: (\d+) passed, (\d+) failed out of (\d+) tests/, "suite passed")),
  },
  {
    id: "03-claims",
    name: "Claim matrix",
    run: commandGate(process.execPath, ["test-claims.mjs"], (output) =>
      matchDetail(output, /CLAIM MATRIX RESULTS: (\d+) passed, (\d+) failed out of (\d+) checks/, "matrix passed")),
  },
  {
    id: "04-schemas",
    name: "Schema gate",
    run: commandGate(process.execPath, ["test-schemas.mjs"], (output) =>
      matchDetail(output, /GATE 3 RESULTS: (\d+) passed, (\d+) failed out of (\d+) checks/, "schemas passed")),
  },
  {
    id: "05-corpus",
    name: "Corpus verification",
    run: commandGate(process.execPath, ["law/fetch.mjs", "verify"], (output) =>
      output.split("\n").at(-1) || "corpus passed"),
  },
  {
    id: "06-compiler",
    name: "Compiler tests",
    run: commandGate(NPM, ["--prefix", "compiler", "test"], (output) =>
      `${matchDetail(output, /ℹ pass (\d+)/, "tests")} passed`),
  },
  {
    id: "07-public-eval",
    name: "Public-eval grader",
    run: commandGate(process.execPath, [
      "evals/grader.mjs",
      "--label",
      "day-3-baseline",
      "--check",
      "evals/results/day-3-baseline.json",
    ], "20 cases; baseline match"),
  },
  {
    id: "08-determinism",
    name: "Golden determinism",
    run: commandGate(process.execPath, ["scripts/check-golden-determinism.mjs"], (output) =>
      output.split("\n").at(-1) || "deterministic"),
  },
  {
    id: "09-package-content",
    name: "Package content",
    run: commandGate(process.execPath, ["scripts/check-package-content.mjs"], (output) =>
      output.split("\n").at(-1) || "package passed"),
  },
  {
    id: "10-version-identity",
    name: "Version identity",
    run: commandGate(process.execPath, ["scripts/check-version-identity.mjs"], (output) =>
      output.split("\n").at(-1) || "version passed"),
  },
];

const results = [];
let failure;

try {
  for (let index = 0; index < gates.length; index += 1) {
    const gate = gates[index];
    if (failure) {
      results.push({ name: gate.name, status: "SKIP", detail: "fail-fast" });
      continue;
    }
    try {
      const result = gate.run(context);
      results.push({ name: gate.name, status: "PASS", detail: result.detail });
      if (options.evidenceDir) {
        writeFileSync(join(options.evidenceDir, `${gate.id}.log`), `${result.output}\n`);
      }
    } catch (error) {
      const output = error.gateOutput || error.stack || String(error);
      failure = { gate, error, output };
      results.push({ name: gate.name, status: "FAIL", detail: error.message });
      if (options.evidenceDir) {
        writeFileSync(join(options.evidenceDir, `${gate.id}.log`), `${output}\n`);
      }
    }
  }

  if (options.evidenceDir) {
    writeFileSync(
      join(options.evidenceDir, "summary.json"),
      `${JSON.stringify({ overall_pass: !failure, gates: results }, null, 2)}\n`,
    );
  }

  if (failure) {
    console.error(`Gate failed: ${failure.gate.name}`);
    console.error(failure.output);
    console.error("");
  }
  printSummary(results);
  if (failure) process.exitCode = 1;
} finally {
  const tempRoot = resolve(tmpdir());
  const resolvedCache = resolve(npmCache);
  if (
    dirname(resolvedCache) !== tempRoot ||
    !basename(resolvedCache).startsWith("lexbeam-verify-npm-cache-") ||
    lstatSync(resolvedCache).isSymbolicLink()
  ) {
    throw new Error(`Refusing to remove unexpected npm cache: ${resolvedCache}`);
  }
  rmSync(resolvedCache, { recursive: true, force: false });
}
