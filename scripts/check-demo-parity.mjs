// Verifies the browser demo's AND the terminal tool's scoring engines give the SAME results as the real TypeScript engine
// (src/lib/rarity/engine.ts) for many random answer sets.
// Run:  node scripts/check-demo-parity.mjs        (needs Node 22.18+ for built-in TS support)

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const demoPath = path.join(root, "docs/index.html");
if (!fs.existsSync(demoPath)) {
  console.error("docs/index.html missing — run: node scripts/build-demo.mjs");
  process.exit(1);
}

// 1) Load the real TS engine from a temp copy (adds .ts to relative imports so Node can resolve them).
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "1inx-parity-"));
for (const f of ["engine", "questions", "archetypes"]) {
  let src = fs.readFileSync(path.join(root, `src/lib/rarity/${f}.ts`), "utf8");
  src = src.replace(/from "\.\/(\w+)"/g, 'from "./$1.ts"');
  fs.writeFileSync(path.join(tmp, `${f}.ts`), src);
}
const real = await import(pathToFileURL(path.join(tmp, "engine.ts")).href);
const { QUESTIONS } = await import(pathToFileURL(path.join(tmp, "questions.ts")).href);

// 2) Load the demo engine (data + engine block) from docs/index.html.
const html = fs.readFileSync(demoPath, "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const dataPart = script.slice(0, script.indexOf("// ==ENGINE_START=="));
const enginePart = script.slice(script.indexOf("// ==ENGINE_START=="), script.indexOf("// ==ENGINE_END=="));
const ctx = vm.createContext({ Math, Number, String, Object, Array });
vm.runInContext(
  `${dataPart}\n${enginePart}\nthis.calculateRarity = calculateRarity; this.formatOneInX = formatOneInX;`,
  ctx,
);

// 2b) Load the terminal tool's engine (cli/src/engine.mjs).
const cliPath = path.join(root, "cli/src/engine.mjs");
if (!fs.existsSync(cliPath)) {
  console.error("cli/src/engine.mjs missing — run: node scripts/build-demo.mjs");
  process.exit(1);
}
const cli = await import(pathToFileURL(cliPath).href);

// 3) Compare on random inputs (seeded so failures are reproducible).
let seed = 1234567;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = (a) => a[Math.floor(rnd() * a.length)];

function randomAnswers() {
  const a = {};
  for (const q of QUESTIONS) {
    if (rnd() < 0.2) continue; // leave some unanswered
    if (q.type === "select") a[q.id] = pick(q.options).value;
    else a[q.id] = q.min + Math.floor(rnd() * (q.max - q.min + 1));
  }
  return a;
}

let failures = 0;
const N = 2000;
for (let i = 0; i < N; i++) {
  const a = randomAnswers();
  const x = real.calculateRarity(a);
  const y = ctx.calculateRarity(a);
  const z = cli.calculateRarity(a);
  const matches = (o) =>
    x.oneInX === o.oneInX &&
    Math.abs(x.percentile - o.percentile) < 1e-9 &&
    x.archetype.id === o.archetype.id &&
    x.confidence === o.confidence &&
    x.rarestTraits.map((t) => t.id).join() === o.rarestTraits.map((t) => t.id).join();
  if (!(matches(y) && matches(z))) {
    failures++;
    if (failures <= 3) console.error("MISMATCH", JSON.stringify(a), { real: x.oneInX, demo: y.oneInX, cli: z.oneInX });
  }
}
fs.rmSync(tmp, { recursive: true, force: true });
if (failures) {
  console.error(`✘ ${failures}/${N} mismatches between the real engine and the demo/terminal tool`);
  process.exit(1);
}
console.log(`✔ demo and terminal-tool engines match the real engine on ${N} random profiles`);
