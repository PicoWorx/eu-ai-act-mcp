import { readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  AdapterDomainPayload,
  RegulationAdapter,
  SourceDocumentDescriptor,
} from "../types.js";

interface LegacyManifestDocument {
  celex: string;
  file: string;
  role: string;
  source_url: string;
  html_sha256: string;
  txt_sha256: string;
  html_bytes: number;
  txt_bytes: number;
  fetched_at: string | null;
}

interface LegacyManifest {
  schema: number;
  tool_version: string;
  pinned_consolidated: string;
  sealed_at: string;
  documents: LegacyManifestDocument[];
}

interface DocumentRule {
  celex: string;
  id: string;
  sourceSnapshotId: string;
  titleMustContain: readonly string[];
  markers: ReadonlyArray<readonly [string, number]>;
}

const RULES: readonly DocumentRule[] = [
  {
    celex: "02024R1689-20260727",
    id: "document.ai-act.consolidated.20260727",
    sourceSnapshotId: "source.oj.2024.1689.consolidated.20260727",
    titleMustContain: ["Consolidated TEXT: 32024R1689", "27.07.2026"],
    markers: [
      ["2 December 2027", 1],
      ["2 December 2026", 2],
      ["point (ba)", 1],
      ["Annex III", 10],
      ["Article 75a", 1],
    ],
  },
  {
    celex: "32026R1744",
    id: "document.ai-act.omnibus.2026.1744",
    sourceSnapshotId: "source.oj.2026.1744",
    titleMustContain: ["L_202601744EN"],
    markers: [
      ["third day following", 1],
      ["Done at Strasbourg", 1],
    ],
  },
  {
    celex: "32024R1689",
    id: "document.ai-act.original.2024.1689",
    sourceSnapshotId: "source.oj.2024.1689.original",
    titleMustContain: ["L_202401689EN"],
    markers: [["2 August 2027", 1]],
  },
  {
    celex: "52025PC0836",
    id: "document.ai-act.proposal.2025.836.superseded",
    sourceSnapshotId: "source.com.2025.836.superseded",
    titleMustContain: ["COM%282025%29836"],
    markers: [
      ["6 months", 1],
      ["Digital Omnibus", 1],
    ],
  },
];

function extractTitle(html: string): string {
  return html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "";
}

export function htmlToText(html: string): string {
  let value = html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, "");
  value = value.replace(/<br\s*\/?>/gi, "\n");
  value = value.replace(/<\/(p|div|td|tr|li|h[1-6])>/gi, "\n");
  let text = value.replace(/<[^>]+>/g, " ");
  text = text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, number: string) => String.fromCodePoint(Number(number)))
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&rsquo;/g, "’")
    .replace(/&amp;/g, "&");
  return text.replace(/[ \t ]+/g, " ").replace(/\n\s*\n+/g, "\n\n");
}

function createDocuments(manifest: LegacyManifest): SourceDocumentDescriptor[] {
  return RULES.map((rule) => {
    const document = manifest.documents.find((candidate) => candidate.celex === rule.celex);
    if (!document) throw new Error(`AI Act manifest is missing CELEX ${rule.celex}`);
    return {
      id: rule.id,
      source_snapshot_id: rule.sourceSnapshotId,
      celex: document.celex,
      source_url: document.source_url,
      source_path: `${document.file}.html`,
      normalized_path: `${document.file}.txt`,
      role: document.role,
      source_media_type: "text/html",
      normalized_media_type: "text/plain",
      expected_source_sha256: document.html_sha256,
      expected_normalized_sha256: document.txt_sha256,
      expected_source_bytes: document.html_bytes,
      expected_normalized_bytes: document.txt_bytes,
    };
  });
}

export function createEuAiActAdapter(manifest: LegacyManifest): RegulationAdapter {
  if (manifest.schema !== 2 || manifest.tool_version !== "fetch.mjs@2") {
    throw new Error("Unsupported legacy AI Act manifest");
  }
  const documents = createDocuments(manifest);
  const ruleByCelex = new Map(RULES.map((rule) => [rule.celex, rule]));

  return {
    regulation_id: "eu-ai-act",
    artifact_id: "artifact.eu-ai-act.normalized-corpus",
    artifact_version: "0.1.0",
    corpus_id: `eu-ai-act-${manifest.pinned_consolidated.replace(
      /^(\d{4})(\d{2})(\d{2})$/,
      "$1-$2-$3",
    )}`,
    verified_at: manifest.sealed_at.slice(0, 10),
    current_instrument:
      "Regulation (EU) 2024/1689 as amended by Regulation (EU) 2026/1744",
    documents,
    normalize(_document, source) {
      return Buffer.from(htmlToText(source.toString("utf8")), "utf8");
    },
    verifySource(document, source) {
      const rule = ruleByCelex.get(document.celex ?? "");
      if (!rule) return [`No verification rule for ${document.id}`];
      const errors: string[] = [];
      const html = source.toString("utf8");
      if (source.length < 100_000) {
        errors.push(`${document.id}: body only ${source.length} bytes`);
      }
      const title = extractTitle(html);
      for (const required of rule.titleMustContain) {
        if (!title.includes(required)) {
          errors.push(`${document.id}: title lacks required ${required}`);
        }
      }
      const text = htmlToText(html);
      for (const [needle, minimum] of rule.markers) {
        const count = text.split(needle).length - 1;
        if (count < minimum) {
          errors.push(`${document.id}: marker ${needle} appears ${count} times, expected ${minimum}`);
        }
      }
      return errors;
    },
    domainPayload(): AdapterDomainPayload {
      return {
        schema_id: "schema.eu-ai-act.compiler-adapter",
        schema_version: "0.1.0",
        fields: ["/adapter_id", "/pinned_consolidated", "/documents"],
        value: {
          adapter_id: "eu-ai-act",
          pinned_consolidated: manifest.pinned_consolidated,
          documents: documents.map((document) => ({
            document_id: document.id,
            celex: document.celex ?? null,
            source_url: document.source_url,
            source_path: document.source_path,
            normalized_path: document.normalized_path,
            role: document.role,
          })),
        },
      };
    },
  };
}

export function loadEuAiActAdapter(lawDirectory: string): RegulationAdapter {
  const manifest = JSON.parse(
    readFileSync(join(lawDirectory, "manifest.json"), "utf8"),
  ) as LegacyManifest;
  return createEuAiActAdapter(manifest);
}
