#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const url = process.argv[2];
if (!url) {
  console.error("Usage: node scripts/set-app-base-url.js <https://your-url>");
  process.exit(1);
}

if (!/^https?:\/\//.test(url)) {
  console.error("APP_BASE_URL must start with http:// or https://");
  process.exit(1);
}

const dotenvCandidates = [".env.local", ".env"];
const targetFile =
  dotenvCandidates.find((candidate) =>
    fs.existsSync(path.resolve(candidate)),
  ) ?? ".env";

const filePath = path.resolve(targetFile);
const raw = fs.readFileSync(filePath, "utf8");
const lines = raw.split(/\r?\n/);
const trimmedUrl = url.trimEnd();

const updatedLines = lines.map((line) => {
  if (line.startsWith("APP_BASE_URL=")) {
    return `APP_BASE_URL=${trimmedUrl}`;
  }
  return line;
});

if (!updatedLines.some((line) => line.startsWith("APP_BASE_URL="))) {
  updatedLines.push(`APP_BASE_URL=${trimmedUrl}`);
}

fs.writeFileSync(filePath, updatedLines.join("\n"));
console.log(
  `Set APP_BASE_URL=${trimmedUrl} inside ${targetFile}. Restart the dev server if it is running.`,
);
