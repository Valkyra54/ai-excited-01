import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });

const source = join(import.meta.dirname, "entry.png");
const target = join(outDir, "entry.png");

const bytes = readFileSync(source);
writeFileSync(target, bytes);

const written = readFileSync(target);
if (!written.equals(bytes)) {
  throw new Error("output entry.png does not match source entry.png");
}
