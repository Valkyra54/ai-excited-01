import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const source = join(import.meta.dirname, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const bytes = readFileSync(source);
const outPath = join(outDir, "entry.png");
writeFileSync(outPath, bytes);
const written = readFileSync(outPath);
if (!bytes.equals(written)) {
  throw new Error("entry.png written to " + outPath + " does not match the source bytes");
}
