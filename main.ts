import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @typedef {object} EntryPaths
 * @property {string} source - The entry.png sitting next to this program.
 * @property {string} outDir - The directory the image is written to.
 * @property {string} target - The full path of the written entry.png.
 */

// One place owns every path decision: the source lives next to this file,
// the destination defaults to /output and is overridden by MAKEFUN_OUTPUT_DIR.
function resolvePaths() {
  const here = dirname(fileURLToPath(import.meta.url));
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  return {
    source: join(here, "entry.png"),
    outDir,
    target: join(outDir, "entry.png"),
  };
}

// Fail loudly unless the file we wrote back is byte-for-byte the source:
// a length mismatch is reported separately from a content mismatch so a
// truncated or padded write is never mistaken for a clean copy.
function verifyCopy(sourceBytes, targetPath) {
  const written = readFileSync(targetPath);
  if (sourceBytes.length !== written.length) {
    throw new Error(
      `entry.png length mismatch at ${targetPath}: expected ${sourceBytes.length} bytes, got ${written.length} bytes`,
    );
  }
  if (!sourceBytes.equals(written)) {
    throw new Error(
      `entry.png content mismatch at ${targetPath}: ${written.length} bytes differ from the source`,
    );
  }
  return written.length;
}

function copyEntry() {
  const paths = resolvePaths();
  const bytes = readFileSync(paths.source);
  mkdirSync(paths.outDir, { recursive: true });
  writeFileSync(paths.target, bytes);
  const verified = verifyCopy(bytes, paths.target);
  console.log(`wrote ${paths.target} (${verified} bytes, verified identical)`);
}

copyEntry();
