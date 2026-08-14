import { isAbsolute, relative, resolve } from "node:path";

export function resolveWithin(root: string, relativePath: string): string {
  if (isAbsolute(relativePath)) {
    throw new Error(`Artifact path must be relative: ${relativePath}`);
  }
  const resolvedRoot = resolve(root);
  const target = resolve(resolvedRoot, relativePath);
  const boundary = relative(resolvedRoot, target);
  if (boundary.startsWith("..") || isAbsolute(boundary)) {
    throw new Error(`Artifact path escapes its root: ${relativePath}`);
  }
  return target;
}
