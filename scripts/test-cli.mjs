// Smoke tests for the `1inx` terminal tool. Run:  node scripts/test-cli.mjs
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { QUESTIONS, calculateRarity } from "../cli/src/engine.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bin = path.join(root, "cli/bin/1inx.mjs");
const sample = path.join(root, "cli/examples/sample-answers.json");
const run = (args, input) =>
  spawnSync(process.execPath, [bin, ...args], { input, encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } });

let failed = 0;
const test = (name, fn) => {
  try {
    fn();
    console.log("✔", name);
  } catch (e) {
    failed++;
    console.error("✘", name, "\n   ", e.message);
  }
};
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

test("--help works", () => {
  const r = run(["--help"]);
  assert(r.status === 0 && r.stdout.includes("1inx"), "help failed");
});

test("--version prints a version", () => {
  const r = run(["--version"]);
  assert(r.status === 0 && /^\d+\.\d+\.\d+/.test(r.stdout.trim()), r.stdout);
});

test("--list-questions lists every question", () => {
  const r = run(["--list-questions"]);
  assert(r.status === 0, "non-zero exit");
  for (const q of QUESTIONS) assert(r.stdout.includes(q.id), `missing ${q.id}`);
});

test("--answers --json gives the same result as the engine", () => {
  const r = run(["--answers", sample, "--json"]);
  assert(r.status === 0, r.stderr);
  const out = JSON.parse(r.stdout);
  const expected = calculateRarity(JSON.parse(await_read(sample)));
  assert(out.oneInX === expected.oneInX, `oneInX ${out.oneInX} != ${expected.oneInX}`);
  assert(out.archetype.id === expected.archetype.id, "archetype differs");
});

test("--answers - reads from stdin", () => {
  const r = run(["--answers", "-", "--json"], JSON.stringify({ hand: "left", eyes: "green", coding: "expert" }));
  assert(r.status === 0, r.stderr);
  assert(JSON.parse(r.stdout).answered === 3, "expected 3 answers");
});

test("bad answer value exits with code 2", () => {
  const r = run(["--answers", "-"], JSON.stringify({ hand: "purple" }));
  assert(r.status === 2 && r.stderr.includes("hand"), `status ${r.status}: ${r.stderr}`);
});

test("unknown question id exits with code 2", () => {
  const r = run(["--answers", "-"], JSON.stringify({ nope: 1 }));
  assert(r.status === 2, `status ${r.status}`);
});

test("fewer than 3 answers exits with code 1", () => {
  const r = run(["--answers", "-"], JSON.stringify({ hand: "left" }));
  assert(r.status === 1, `status ${r.status}`);
});

test("interactive mode: typed answers match the engine", () => {
  // Answer the first 12 quick questions: option 1 for selects, the minimum for numbers.
  const quick = ["hand", "eyes", "education", "languages", "income", "business", "sleep",
    "countries", "coding", "instruments", "creative", "risk"].map((id) => QUESTIONS.find((q) => q.id === id));
  const lines = quick.map((q) => (q.type === "select" ? "1" : String(q.min)));
  const r = run(["--quick", "--json"], lines.join("\n") + "\n");
  assert(r.status === 0, r.stderr);
  const expected = {};
  quick.forEach((q) => (expected[q.id] = q.type === "select" ? q.options[0].value : q.min));
  const e = calculateRarity(expected);
  assert(JSON.parse(r.stdout).oneInX === e.oneInX, "interactive result differs from engine");
});

test("interactive mode: invalid input re-asks, Enter skips, q finishes early", () => {
  // hand: "9" (invalid) then "2" (left); eyes: Enter (skip); education: "1"; languages: "3"; then q.
  const r = run(["--quick", "--json"], ["9", "2", "", "1", "3", "q"].join("\n") + "\n");
  assert(r.status === 0, r.stderr);
  assert(JSON.parse(r.stdout).answered === 3, "expected 3 answered");
});

test("interactive mode: ending input early still works", () => {
  const r = run(["--quick", "--json"], ["1", "1", "1"].join("\n") + "\n");
  assert(r.status === 0, r.stderr);
});

test("text output renders the headline", () => {
  const r = run(["--answers", sample]);
  assert(r.status === 0 && /You are\s+1 in/.test(r.stdout), r.stdout);
});

import fs from "node:fs";
function await_read(p) {
  return fs.readFileSync(p, "utf8");
}

if (failed) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log("\nAll CLI tests passed");
