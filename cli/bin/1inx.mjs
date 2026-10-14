#!/usr/bin/env node
// 1inx — find out how rare you really are, right in your terminal.
// Zero dependencies. Uses the exact same scoring engine as the website and the browser demo.

import fs from "node:fs";
import readline from "node:readline";
import { QUESTIONS, calculateRarity, formatOneInX } from "../src/engine.mjs";

const pkg = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f) => {
  const i = argv.indexOf(f);
  return i === -1 ? undefined : argv[i + 1];
};

// ---------- colors ----------
const useColor = process.stdout.isTTY && !process.env.NO_COLOR && !has("--no-color");
const paint = (code) => (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : String(s));
const bold = paint("1");
const dim = paint("2");
const violet = paint("38;5;99");
const magenta = paint("38;5;205");
const gold = paint("38;5;221");
const red = paint("38;5;203");

// A shorter list for people in a hurry.
const QUICK_IDS = ["hand", "eyes", "education", "languages", "income", "business", "sleep",
  "countries", "coding", "instruments", "creative", "risk"];

const HELP = `
${bold("1inx")} — how rare are you, really?

${bold("Usage")}
  1inx                     answer all ${QUESTIONS.length} questions in the terminal
  1inx --quick             answer just ${QUICK_IDS.length} key questions
  1inx --answers me.json   skip the questions, read answers from a JSON file ("-" = stdin)
  1inx --list-questions    show every question id and its allowed answers

${bold("Options")}
  --json         print the result as JSON (great for scripts)
  --no-color     turn off colors
  -h, --help     show this help
  -v, --version  show the version

${bold("Answers file")}  a JSON object of  question-id → answer, for example:
  { "hand": "left", "eyes": "green", "languages": 4, "countries": 30, "coding": "expert" }

While answering: press ${bold("Enter")} to skip a question, ${bold("q")} to finish early.
Results are a fun estimate from simplified global statistics, not science.
`;

// ---------- helpers ----------
const byId = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));

function describeAllowed(q) {
  if (q.type === "select") return q.options.map((o) => o.value).join(" | ");
  return `number ${q.min}–${q.max}${q.unit ? " " + q.unit : ""}`;
}

function listQuestions() {
  for (const q of QUESTIONS) {
    console.log(`${bold(q.id.padEnd(12))} ${q.label}`);
    console.log(`${" ".repeat(13)}${dim(describeAllowed(q))}`);
  }
}

/** Validate a plain object of answers. Returns { answers, problems }. */
function normalizeAnswers(input) {
  const answers = {};
  const problems = [];
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return { answers, problems: ["Answers must be a JSON object like { \"hand\": \"left\" }."] };
  }
  for (const [id, raw] of Object.entries(input)) {
    const q = byId[id];
    if (!q) {
      problems.push(`Unknown question "${id}" (run 1inx --list-questions)`);
      continue;
    }
    if (raw === "" || raw === null || raw === undefined) continue;
    if (q.type === "select") {
      if (!q.options.some((o) => o.value === raw)) problems.push(`"${id}": "${raw}" is not valid. Use: ${describeAllowed(q)}`);
      else answers[id] = raw;
    } else {
      const n = Number(raw);
      if (!Number.isFinite(n) || n < q.min || n > q.max) problems.push(`"${id}": ${JSON.stringify(raw)} must be a number from ${q.min} to ${q.max}`);
      else answers[id] = n;
    }
  }
  return { answers, problems };
}

// ---------- interactive mode ----------
// With --json, questions go to stderr so stdout stays clean, machine-readable JSON.
const out = has("--json") ? process.stderr : process.stdout;
const say = (s = "") => out.write(s + "\n");

async function interactive(questions) {
  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  const lines = rl[Symbol.asyncIterator]();
  const ask = async (prompt) => {
    out.write(prompt);
    const r = await lines.next();
    return r.done ? null : r.value.trim();
  };

  const answers = {};
  say(`\n${bold(violet("1 in"))} ${bold(magenta("X"))}  ${dim("— how rare are you, really?")}`);
  say(dim("Press Enter to skip a question, or type q to finish early.\n"));

  outer: for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    say(`${dim(`[${i + 1}/${questions.length}]`)} ${bold(q.label)} ${dim("· " + q.category)}`);
    if (q.type === "select") q.options.forEach((o, j) => say(`  ${gold(String(j + 1).padStart(2))}) ${o.label}`));

    for (;;) {
      const prompt = q.type === "select"
        ? `  Choose 1-${q.options.length}: `
        : `  Enter ${q.min}-${q.max}${q.unit ? " " + q.unit : ""}: `;
      const reply = await ask(prompt);
      if (reply === null || reply.toLowerCase() === "q") break outer; // finish early / input ended
      if (reply === "") break; // skip

      if (q.type === "select") {
        const n = Number(reply);
        if (Number.isInteger(n) && n >= 1 && n <= q.options.length) {
          answers[q.id] = q.options[n - 1].value;
          break;
        }
        say(red(`  Please type a number from 1 to ${q.options.length}.`));
      } else {
        const n = Number(reply);
        if (Number.isFinite(n) && n >= q.min && n <= q.max) {
          answers[q.id] = n;
          break;
        }
        say(red(`  Please type a number from ${q.min} to ${q.max}.`));
      }
    }
    say("");
  }
  rl.close();
  return answers;
}

// ---------- output ----------
function bar(pct, width = 32) {
  const filled = Math.max(0, Math.min(width, Math.round((pct / 100) * width)));
  return violet("█".repeat(filled)) + dim("░".repeat(width - filled));
}

function printResult(r) {
  const pct = r.percentile.toFixed(2);
  const match = r.globalRarity < 0.01 ? r.globalRarity.toFixed(5) : r.globalRarity.toFixed(3);
  console.log(`\n${bold("✨ Your result")}\n`);
  console.log(`   ${dim("You are")}  ${bold(magenta("1 in " + formatOneInX(r.oneInX)))}`);
  console.log(`   ${dim(`Rarer than ${pct}% of people`)}`);
  console.log(`   ${bar(r.percentile)}\n`);
  console.log(`   ${match}% of people match your profile ${dim(`· confidence ${Math.round(r.confidence * 100)}% (${r.answered}/${QUESTIONS.length} answered)`)}\n`);

  const a = r.archetype;
  console.log(`   ${a.emoji}  ${bold(a.name)}  ${dim("— " + a.tagline)}`);
  console.log(`   ${a.description}`);
  console.log(`   ${dim("Strengths:")} ${a.strengths.join(", ")}\n`);

  console.log(`   ${bold("Your rarest traits")}`);
  for (const t of r.rarestTraits) console.log(`   ${gold("•")} ${t.label}: ${t.answerLabel} ${dim(`(${t.rarity}% of people)`)}`);
  console.log(`\n${dim("A fun estimate from simplified global statistics, not science.")}\n`);
}

function toJson(r) {
  return {
    oneInX: r.oneInX,
    percentile: Number(r.percentile.toFixed(4)),
    globalRarityPercent: Number(r.globalRarity.toFixed(6)),
    confidence: r.confidence,
    answered: r.answered,
    archetype: { id: r.archetype.id, name: r.archetype.name, tagline: r.archetype.tagline },
    rarestTraits: r.rarestTraits.map((t) => ({ id: t.id, label: t.label, answer: t.answerLabel, rarityPercent: t.rarity })),
    traits: r.traits.map((t) => ({ id: t.id, label: t.label, answer: t.answerLabel, rarityPercent: t.rarity })),
  };
}

// ---------- main ----------
async function main() {
  if (has("-h") || has("--help")) return console.log(HELP);
  if (has("-v") || has("--version")) return console.log(pkg.version);
  if (has("--list-questions")) return listQuestions();

  let answers;
  const file = val("--answers");
  if (has("--answers")) {
    if (!file) {
      console.error(red("--answers needs a file name (or - to read from stdin)."));
      process.exit(2);
    }
    let text;
    try {
      text = fs.readFileSync(file === "-" ? 0 : file, "utf8");
    } catch (e) {
      console.error(red(`Could not read ${file}: ${e.message}`));
      process.exit(2);
    }
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error(red(`${file} is not valid JSON.`));
      process.exit(2);
    }
    const { answers: ok, problems } = normalizeAnswers(parsed);
    if (problems.length) {
      for (const p of problems) console.error(red("✘ ") + p);
      process.exit(2);
    }
    answers = ok;
  } else {
    const list = has("--quick") ? QUICK_IDS.map((id) => byId[id]) : QUESTIONS;
    answers = await interactive(list);
  }

  const result = calculateRarity(answers);
  if (result.answered < 3) {
    console.error(red(`\nAnswer at least 3 questions to get a result (you answered ${result.answered}).`));
    process.exit(1);
  }
  if (has("--json")) console.log(JSON.stringify(toJson(result), null, 2));
  else printResult(result);
}

main().catch((e) => {
  console.error(red(e?.stack || String(e)));
  process.exit(1);
});
