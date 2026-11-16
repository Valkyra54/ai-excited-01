// SPDX-License-Identifier: MIT
// ai-excited-01 entry program: copies the entry image to the output path
// byte-for-byte, deterministically, and verifies the result.
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MAX_BYTES = 1024 * 1024;
const MAX_SIDE = 1024;

function fail(message) {
  console.error("main.ts: " + message);
  process.exit(1);
}

function main() {
  const scriptDir = __dirname;
  const inputPath = path.join(scriptDir, "entry.png");
  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  const outputPath = path.join(outDir, "entry.png");

  let data;
  try {
    data = fs.readFileSync(inputPath);
  } catch (err) {
    fail("cannot read entry image " + inputPath + ": " + err.message);
  }

  if (!data.subarray(0, 8).equals(PNG_SIGNATURE)) {
    fail("entry image is not a PNG (bad signature)");
  }
  if (data.length > MAX_BYTES) {
    fail("entry image is " + data.length + " bytes, over the 1 MiB limit");
  }
  if (data.length < 33) {
    fail("entry image too short to hold an IHDR chunk");
  }
  // The first chunk must be IHDR: a 4-byte length of 13, then the ASCII type "IHDR".
  // Without this check the width/height below could be read from a malformed file
  // whose first chunk is not IHDR at all.
  if (data.readUInt32BE(8) !== 13 || data.subarray(12, 16).toString("ascii") !== "IHDR") {
    fail("entry image has no valid IHDR chunk");
  }
  // PNG dimensions live in the IHDR chunk: width at bytes 16-19, height at 20-23.
  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  if (width > MAX_SIDE || height > MAX_SIDE) {
    fail("entry image is " + width + "x" + height + ", over the 1024x1024 limit");
  }

  try {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outputPath, data);
  } catch (err) {
    fail("cannot write output " + outputPath + ": " + err.message);
  }

  let written;
  try {
    written = fs.readFileSync(outputPath);
  } catch (err) {
    fail("cannot read back output " + outputPath + ": " + err.message);
  }
  if (!written.equals(data)) {
    fail("output differs from the entry image");
  }

  const digest = crypto.createHash("sha256").update(written).digest("hex");
  console.log("wrote " + outputPath + " (" + width + "x" + height + ", " + written.length + " bytes, sha256 " + digest + ")");
}

main();
