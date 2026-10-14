// Verifies the demo's scoring engine gives the SAME results as the real TypeScript engine
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
  const same =
    x.oneInX === y.oneInX &&
    Math.abs(x.percentile - y.percentile) < 1e-9 &&
    x.archetype.id === y.archetype.id &&
    x.confidence === y.confidence &&
    x.rarestTraits.map((t) => t.id).join() === y.rarestTraits.map((t) => t.id).join();
  if (!same) {
    failures++;
    if (failures <= 3) console.error("MISMATCH", JSON.stringify(a), { real: x.oneInX, demo: y.oneInX });
  }
}
fs.rmSync(tmp, { recursive: true, force: true });
if (failures) {
  console.error(`✘ ${failures}/${N} mismatches between demo and real engine`);
  process.exit(1);
}
console.log(`✔ demo engine matches the real engine on ${N} random profiles`);
