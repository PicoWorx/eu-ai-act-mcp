#!/usr/bin/env node
/**
 * law/fetch.mjs - CLI over the EUR-Lex Cellar API for this repo's pinned legal corpus.
 *
 *   node law/fetch.mjs fetch      re-download all corpus documents (html + txt)
 *   node law/fetch.mjs verify     offline: check every marker against the local txt files
 *   node law/fetch.mjs freshness  network: warn if EUR-Lex lists a newer consolidated version
 *
 * The corpus is the ground truth the test suite compares legal assertions against.
 * PINNED_CONSOLIDATED is the consolidation date this release was verified against;
 * bump it deliberately, never implicitly.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
export const PINNED_CONSOLIDATED = "20260727";
// EUR-Lex serves an empty 200 to non-browser user agents; a browser UA is required.
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

// Every document carries markers proving it is the right text. A failed marker
// means the fetch returned the wrong document, a partial page, or the law moved.
const DOCS = [
  {
    celex: `02024R1689-${PINNED_CONSOLIDATED}`,
    file: `celex-02024R1689-${PINNED_CONSOLIDATED}-consolidated`,
    role: "operative law: the AI Act as amended by Reg. (EU) 2026/1744",
    markers: [
      ["2 December 2027", 1], // amended Art. 113(3)(c)(i)
      ["2 December 2026", 2], // Art. 111(4) legacy transition + Art. 113(3)(a)
      ["point (ba)", 1],      // enacted new prohibition, NCII
      ["Annex III", 10],
    ],
  },
  {
    celex: "32026R1744",
    file: "celex-32026R1744-omnibus",
    role: "amending act: Digital Omnibus on AI, OJ 2026-07-24, in force 2026-07-27",
    markers: [
      ["third day following", 1],
      ["Done at Strasbourg", 1],
    ],
  },
  {
    celex: "32024R1689",
    file: "celex-32024R1689-original",
    role: "superseded original act, kept to label pre-amendment text",
    markers: [["2 August 2027", 1]],
  },
  {
    celex: "52025PC0836",
    file: "celex-52025PC0836-proposal-SUPERSEDED",
    role: "SUPERSEDED Commission proposal; source of the deleted '6 months' trigger. NOT LAW.",
    markers: [
      ["6 months", 1],
      ["Digital Omnibus", 1],
    ],
  },
];

const url = (celex) =>
  `https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:${celex}`;

function htmlToText(h) {
  h = h.replace(/<(script|style)[\s\S]*?<\/\1>/gi, "");
  h = h.replace(/<br\s*\/?>/gi, "\n");
  h = h.replace(/<\/(p|div|td|tr|li|h[1-6])>/gi, "\n");
  let t = h.replace(/<[^>]+>/g, " ");
  t = t
    .replace(/&nbsp;| /g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&quot;/g, '"');
  t = t.replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n\n");
  return t;
}

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

// node fetch gets an empty 200 from EUR-Lex where curl succeeds; use curl as transport.
function curlGet(u) {
  return execFileSync("curl", ["-sL", "-A", UA, "--max-time", "90", u], {
    maxBuffer: 64 * 1024 * 1024,
    encoding: "utf8",
  });
}

async function fetchDoc(doc) {
  const html = curlGet(url(doc.celex));
  // Never overwrite the corpus with a bad body: validate size and markers first.
  if (html.length < 100_000)
    throw new Error(
      `${doc.celex}: body only ${html.length} bytes, refusing to overwrite. ` +
      `EUR-Lex answers request bursts with an empty 202; wait a few minutes and retry ` +
      `with: node law/fetch.mjs fetch ${doc.celex}`
    );
  const txt = htmlToText(html);
  for (const [needle, min] of doc.markers) {
    const n = txt.split(needle).length - 1;
    if (n < min)
      throw new Error(`${doc.celex}: fetched body fails marker "${needle}" (${n}x < ${min}), refusing to overwrite`);
  }
  writeFileSync(join(DIR, `${doc.file}.html`), html);
  writeFileSync(join(DIR, `${doc.file}.txt`), txt);
}

function verifyDoc(doc) {
  const p = join(DIR, `${doc.file}.txt`);
  if (!existsSync(p)) return [`${doc.celex}: MISSING ${doc.file}.txt`];
  const t = readFileSync(p, "utf8");
  const fails = [];
  for (const [needle, min] of doc.markers) {
    const n = t.split(needle).length - 1;
    if (n < min) fails.push(`${doc.celex}: marker "${needle}" found ${n}x, expected >=${min}`);
  }
  return fails;
}

function writeManifest() {
  const rows = DOCS.map((d) => {
    const hp = join(DIR, `${d.file}.html`);
    const tp = join(DIR, `${d.file}.txt`);
    if (!existsSync(tp) || readFileSync(tp).length === 0)
      return `| ${d.celex} | ${d.file} | ${d.role} | PENDING (throttled, refetch) | - |`;
    const html = readFileSync(hp);
    const txt = readFileSync(tp);
    return `| ${d.celex} | ${d.file} | ${d.role} | ${sha256(txt).slice(0, 16)} | ${html.length} / ${txt.length} |`;
  });
  const md = [
    "# Legal corpus manifest",
    "",
    "Fetched from the EUR-Lex Cellar API (`legal-content/EN/TXT/HTML/?uri=CELEX:...`).",
    `Pinned consolidation date: **${PINNED_CONSOLIDATED}**. Regenerate with \`node law/fetch.mjs fetch\`,`,
    "verify offline with `node law/fetch.mjs verify`, check for newer law with `node law/fetch.mjs freshness`.",
    "",
    `Last fetch: ${new Date().toISOString()}`,
    "",
    "| CELEX | File | Role | sha256(txt) prefix | bytes html/txt |",
    "|---|---|---|---|---|",
    ...rows,
    "",
    "EU legal texts are public domain under Commission Decision 2011/833/EU.",
  ].join("\n");
  writeFileSync(join(DIR, "MANIFEST.md"), md);
}

async function freshness() {
  let page;
  try {
    page = curlGet("https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX:32024R1689");
  } catch (e) {
    console.log(`freshness: could not query EUR-Lex (${e.message})`);
    return 0;
  }
  const dates = [...page.matchAll(/02024R1689-(\d{8})/g)].map((m) => m[1]);
  if (!dates.length) {
    console.log("freshness: no consolidated-version references found; check manually");
    return 0;
  }
  const newest = dates.sort().at(-1);
  if (newest > PINNED_CONSOLIDATED) {
    console.error(`freshness: NEWER consolidated version exists: ${newest} (pinned: ${PINNED_CONSOLIDATED}). The law moved.`);
    return 1;
  }
  console.log(`freshness: pinned ${PINNED_CONSOLIDATED} is the newest consolidated version (${dates.length} refs seen).`);
  return 0;
}

const cmd = process.argv[2] ?? "verify";
const only = process.argv[3];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
if (cmd === "fetch") {
  const targets = only ? DOCS.filter((d) => d.celex === only) : DOCS;
  if (!targets.length) { console.error(`unknown celex: ${only}`); process.exit(2); }
  for (const d of targets) {
    await fetchDoc(d);
    console.log(`fetched ${d.celex}`);
    await sleep(4000); // stay under the EUR-Lex burst throttle
  }
  writeManifest();
  const fails = DOCS.flatMap(verifyDoc);
  if (fails.length) {
    console.error(fails.join("\n"));
    process.exit(1);
  }
  console.log("all markers verified after fetch");
} else if (cmd === "manifest") {
  writeManifest();
  console.log("MANIFEST.md written");
} else if (cmd === "verify") {
  const fails = DOCS.flatMap(verifyDoc);
  if (fails.length) {
    console.error(fails.join("\n"));
    process.exit(1);
  }
  console.log(`corpus verified: ${DOCS.length} documents, all markers present`);
} else if (cmd === "freshness") {
  process.exit(await freshness());
} else {
  console.error(`unknown command: ${cmd} (use fetch | verify | freshness)`);
  process.exit(2);
}
