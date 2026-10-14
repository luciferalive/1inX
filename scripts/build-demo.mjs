// Builds docs/index.html (the GitHub Pages demo) from the real source of truth:
//   src/lib/rarity/questions.ts  and  src/lib/rarity/archetypes.ts
// Run:  node scripts/build-demo.mjs
// No dependencies needed (Node 18+).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

function between(src, startMarker, endMarker, name) {
  const s = src.indexOf(startMarker);
  if (s === -1) throw new Error(`Could not find "${startMarker}" in ${name}`);
  const e = endMarker ? src.indexOf(endMarker, s) : src.length;
  if (e === -1) throw new Error(`Could not find "${endMarker}" in ${name}`);
  return src.slice(s + startMarker.length, e).trim();
}

const questions = between(
  read("src/lib/rarity/questions.ts"),
  "export const QUESTIONS: Question[] =",
  "export const CATEGORIES",
  "questions.ts",
);
const archetypes = between(
  read("src/lib/rarity/archetypes.ts"),
  "export const ARCHETYPES: Record<string, Archetype> =",
  null,
  "archetypes.ts",
);

const template = read("scripts/demo-template.html");
const html = template
  .replace("/*__QUESTIONS__*/", () => `const QUESTIONS = ${questions}`)
  .replace("/*__ARCHETYPES__*/", () => `const ARCHETYPES = ${archetypes}`);

fs.mkdirSync(path.join(root, "docs"), { recursive: true });
fs.writeFileSync(path.join(root, "docs/index.html"), html);
fs.writeFileSync(path.join(root, "docs/.nojekyll"), "");
console.log(`Wrote docs/index.html (${(html.length / 1024).toFixed(1)} KB)`);
