import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { compareUnicodeCodePoints } from "./canonical-json.js";
import { resolveWithin } from "./paths.js";
import type { RegulationAdapter, SourceDocumentDescriptor } from "./types.js";

const execFileAsync = promisify(execFile);

export interface FetchTransport {
  fetch(document: SourceDocumentDescriptor): Promise<Buffer>;
}

export class CurlFetchTransport implements FetchTransport {
  constructor(
    private readonly userAgent =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  ) {}

  async fetch(document: SourceDocumentDescriptor): Promise<Buffer> {
    const { stdout } = await execFileAsync(
      "curl",
      [
        "-sL",
        "--fail",
        "-A",
        this.userAgent,
        "--max-time",
        "90",
        document.source_url,
      ],
      {
        encoding: "buffer",
        maxBuffer: 10 * 1024 * 1024,
      },
    );
    return stdout;
  }
}

export interface FetchOptions {
  adapter: RegulationAdapter;
  target_directory: string;
  transport?: FetchTransport;
}

export async function fetchRegulationSources(options: FetchOptions): Promise<string[]> {
  const transport = options.transport ?? new CurlFetchTransport();
  await mkdir(options.target_directory, { recursive: true });
  const stagingDirectory = await mkdtemp(join(options.target_directory, ".compiler-fetch-"));
  const staged: Array<{ document: SourceDocumentDescriptor; path: string }> = [];

  try {
    const documents = [...options.adapter.documents].sort((left, right) =>
      compareUnicodeCodePoints(left.source_path, right.source_path),
    );
    for (const document of documents) {
      const bytes = await transport.fetch(document);
      const issues = options.adapter.verifySource(document, bytes);
      if (issues.length > 0) {
        throw new Error(issues.join("\n"));
      }
      const stagedPath = resolveWithin(stagingDirectory, document.source_path);
      await mkdir(dirname(stagedPath), { recursive: true });
      await writeFile(stagedPath, bytes);
      staged.push({ document, path: stagedPath });
    }

    const written: string[] = [];
    for (const item of staged) {
      const target = resolveWithin(options.target_directory, item.document.source_path);
      await mkdir(dirname(target), { recursive: true });
      await rename(item.path, target);
      written.push(target);
    }
    return written;
  } finally {
    await rm(stagingDirectory, { recursive: true, force: true });
  }
}

export class DirectoryFetchTransport implements FetchTransport {
  constructor(private readonly sourceDirectory: string) {}

  async fetch(document: SourceDocumentDescriptor): Promise<Buffer> {
    return readFile(resolveWithin(this.sourceDirectory, document.source_path));
  }
}
