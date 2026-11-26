// Funniest One-Line Out-of-Office Reply.
//
// Writes one out-of-office reply line to entry.txt in the output directory.
// Deterministic: no network, no randomness, no secrets, no model calls.
// Runs on Node 22 using only the standard library.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The reply itself. 103 characters, one line, inside the 160-character gate.
const ENTRY_LINE =
  "I am out of office until further notice, because my out-of-office reply is currently out of office too.";

// The competition gate: entry.txt must be UTF-8 text of 1 to 160 characters,
// not only white space, and a single line.
const MAX_CHARS = 160;

const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUTPUT_FILE = "entry.txt";

function assertValidLine(line: string): void {
  const trimmed = line.trim();
  if (trimmed.length === 0) {
    throw new Error("entry line must not be empty or only whitespace");
  }
  if (line !== trimmed) {
    throw new Error("entry line must not start or end with whitespace");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry line must be a single line");
  }
  // Control characters (tabs, escapes, ...) would not survive as a clean
  // one-line auto-reply, so reject any of them outright.
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001F\u007F]/.test(line)) {
    throw new Error("entry line must not contain control characters");
  }
  if (line.length > MAX_CHARS) {
    throw new Error(
      `entry line is ${line.length} characters, over the ${MAX_CHARS} limit`,
    );
  }
}

function writeEntry(line: string): string {
  assertValidLine(line);
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const target = join(OUTPUT_DIR, OUTPUT_FILE);
  writeFileSync(target, line, "utf8");
  return target;
}

function main(): void {
  const target = writeEntry(ENTRY_LINE);
  // Prove the file on disk is exactly the line we intended.
  const written = readFileSync(target, "utf8");
  if (written !== ENTRY_LINE) {
    throw new Error(`entry written to ${target} does not match the reply`);
  }
}

main();
