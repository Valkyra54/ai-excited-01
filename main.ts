// R1 entry: copies the bundled entry.png to the output directory, byte for byte.
// The source image lives next to this program; the destination is
// MAKEFUN_OUTPUT_DIR (default /output) in the sandbox.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface EntryPaths {
  sourcePath: string;
  outDir: string;
  targetPath: string;
}

function resolvePaths(): EntryPaths {
  const here = dirname(fileURLToPath(import.meta.url));
  const sourcePath = join(here, "entry.png");
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  return { sourcePath, outDir, targetPath: join(outDir, "entry.png") };
}

// Reads the written file back and compares it with the source bytes, so a
// truncated or corrupted write is caught with a useful message instead of
// silently producing a bad entry.
async function verifyCopy(sourceBytes: Buffer, targetPath: string): Promise<void> {
  const written = await readFile(targetPath);
  if (written.length !== sourceBytes.length) {
    throw new Error(
      `entry.png length mismatch after write: expected ${sourceBytes.length} bytes, got ${written.length} bytes at ${targetPath}`,
    );
  }
  if (!written.equals(sourceBytes)) {
    throw new Error(`entry.png bytes differ after write: ${targetPath}`);
  }
}

async function copyEntry(): Promise<number> {
  const { sourcePath, outDir, targetPath } = resolvePaths();
  const bytes = await readFile(sourcePath);
  await mkdir(outDir, { recursive: true });
  await writeFile(targetPath, bytes);
  await verifyCopy(bytes, targetPath);
  console.log(`wrote ${targetPath} (${bytes.length} bytes, verified)`);
  return bytes.length;
}

await copyEntry();
