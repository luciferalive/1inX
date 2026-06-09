import { QUESTIONS, type Question } from "./questions";
import { ARCHETYPES, type Archetype } from "./archetypes";

export type Answers = Record<string, string | number>;

export type TraitResult = {
  id: string;
  label: string;
  category: string;
  answerLabel: string;
  rarity: number; // % of pop with this answer
};

export type RarityResult = {
  oneInX: number;
  percentile: number; // % of people you are rarer than
  globalRarity: number; // % of population matching your full profile
  countryRarity: number;
  continentRarity: number;
  traits: TraitResult[];
  rarestTraits: TraitResult[];
  commonTraits: TraitResult[];
  archetype: Archetype;
  archetypeRarity: number;
  confidence: number; // 0-1; how much we trust this score
  modelVersion: string;
};

// ---------- Hybrid rarity model ----------
// Hard caps to keep results believable. No "1 in 999,999,999", no "100%".
const MIN_ONE_IN_X = 8;
const MAX_ONE_IN_X = 2_500_000;
const MIN_PERCENTILE = 50;
const MAX_PERCENTILE = 99.97;
const MIN_TRAIT_RARITY = 2; // a single answer can't be rarer than 2%
const MODEL_VERSION = "hybrid-v1";

// Correlation: traits aren't independent. We dampen the log-sum.
// More answered questions → assume more redundancy → stronger dampening.
function correlationFactor(n: number): number {
  if (n <= 4) return 0.45;
  if (n <= 8) return 0.38;
  if (n <= 14) return 0.30;
  if (n <= 20) return 0.24;
  return 0.20;
}

function rawRarityForAnswer(q: Question, value: string | number): number {
  if (q.type === "select" && q.options) {
    const opt = q.options.find((o) => o.value === value);
    return opt?.rarity ?? 50;
  }
  if ((q.type === "number" || q.type === "slider" || q.type === "height") && q.rarityFn) {
    return q.rarityFn(Number(value));
  }
  return 50;
}

function labelForAnswer(q: Question, value: string | number): string {
  if (q.type === "select" && q.options) {
    return q.options.find((o) => o.value === value)?.label ?? String(value);
  }
  if (q.type === "height") {
    const cm = Number(value);
    const totalIn = cm / 2.54;
    const ft = Math.floor(totalIn / 12);
    const inch = Math.round(totalIn - ft * 12);
    return `${cm} cm · ${ft}'${inch}"`;
  }
  return `${value}${q.unit ? " " + q.unit : ""}`;
}

function pickArchetype(answers: Answers, traits: TraitResult[]): Archetype {
  const score: Record<string, number> = {};
  const add = (k: string, n: number) => (score[k] = (score[k] ?? 0) + n);

  const a = answers;
  const countries = Number(a.countries ?? 0);
  const langs = Number(a.languages ?? 1);
  const income = String(a.income ?? "");
  const business = String(a.business ?? "");
  const coding = String(a.coding ?? "");
  const reading = Number(a.reading ?? 0);
  const sleep = String(a.sleep ?? "");
  const intro = Number(a.intro ?? 5);
  const leader = Number(a.leader ?? 5);
  const creative = Number(a.creative ?? 5);
  const risk = Number(a.risk ?? 5);
  const ai = String(a.ai ?? "");
  const instruments = Number(a.instruments ?? 0);
  const fitness = Number(a.fitness ?? 0);

  add("global_dealmaker", countries * 2 + (income.includes("250") || income === "1m+" ? 25 : 0) + (business !== "no" ? 10 : 0));
  add("silent_strategist", (10 - intro) * 3 + leader * 2 + (reading > 10 ? 10 : 0));
  add("digital_nomad", countries * 3 + (coding !== "no" ? 8 : 0));
  add("chaos_explorer", risk * 4 + (business !== "no" ? 10 : 0));
  add("data_warrior", (coding === "pro" || coding === "expert" ? 25 : coding === "basic" ? 10 : 0) + reading);
  add("visionary_operator", leader * 3 + risk * 2 + (business === "yes" || business === "multi" ? 20 : 0));
  add("modern_renaissance", langs * 5 + instruments * 6 + creative * 2);
  add("curious_thinker", reading + (10 - leader) + creative * 2);
  add("world_connector", intro * 3 + countries + (leader > 6 ? 10 : 0));
  add("maverick_creator", creative * 4 + (business !== "no" ? 8 : 0) + risk * 2);
  add("night_owl_genius", (sleep === "owl" ? 35 : sleep === "late" ? 18 : 0) + creative * 2 + (coding !== "no" ? 5 : 0));
  add("master_builder", fitness * 2 + (ai === "power" ? 6 : 0) + (10 - risk) + leader);

  for (const t of traits) if (t.rarity < 5) add(pickByCategory(t.category), 5);

  const winner = Object.entries(score).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "curious_thinker";
  return ARCHETYPES[winner];
}

function pickByCategory(cat: string): string {
  switch (cat) {
    case "Travel": return "digital_nomad";
    case "Career": return "global_dealmaker";
    case "Skills": return "modern_renaissance";
    case "Personality": return "visionary_operator";
    case "Technology": return "data_warrior";
    case "Lifestyle": return "night_owl_genius";
    default: return "curious_thinker";
  }
}

// Continent population share (very approximate)
const CONTINENT_SHARE: Record<string, number> = {
  asia: 0.59, africa: 0.18, europe: 0.09, namerica: 0.075,
  samerica: 0.055, oceania: 0.006, antarctica: 0.00001,
};

export function calculateRarity(answers: Answers): RarityResult {
  const traits: TraitResult[] = [];
  let logSum = 0;
  let answered = 0;

  for (const q of QUESTIONS) {
    if (answers[q.id] === undefined || answers[q.id] === "") continue;
    const raw = rawRarityForAnswer(q, answers[q.id]);
    // Floor each trait so no single answer makes you "0.001%"
    const r = Math.max(MIN_TRAIT_RARITY, Math.min(99, raw));
    traits.push({
      id: q.id,
      label: q.label,
      category: q.category,
      answerLabel: labelForAnswer(q, answers[q.id]),
      rarity: r,
    });
    logSum += Math.log(r / 100);
    answered++;
  }

  // Hybrid model: dampened multiplication of trait rarities
  const factor = correlationFactor(answered);
  const dampened = logSum * factor;
  let globalRarity = Math.exp(dampened) * 100; // % of population matching

  // Clamp to believable range
  const minGlobal = (1 / MAX_ONE_IN_X) * 100;       // ~0.00004%
  const maxGlobal = (1 / MIN_ONE_IN_X) * 100;       // 12.5%
  globalRarity = Math.max(minGlobal, Math.min(maxGlobal, globalRarity));

  const oneInX = Math.round(Math.max(MIN_ONE_IN_X, Math.min(MAX_ONE_IN_X, 100 / globalRarity)));
  const percentile = Math.max(MIN_PERCENTILE, Math.min(MAX_PERCENTILE, 100 - globalRarity));

  // Country / continent rarity using real-ish population shares.
  const continentKey = String(answers.continent ?? "");
  const continentShare = CONTINENT_SHARE[continentKey] ?? 0.15;
  // Within a continent your % is higher (smaller denominator → larger share)
  const continentRarity = Math.min(80, globalRarity / continentShare);
  // Country ≈ continent / ~30 (rough avg countries per continent weighted)
  const countryRarity = Math.min(95, continentRarity * 4);

  const sorted = [...traits].sort((a, b) => a.rarity - b.rarity);
  const rarestTraits = sorted.slice(0, 3);
  const commonTraits = sorted.slice(-3).reverse();

  const archetype = pickArchetype(answers, traits);
  const baseArchetype = 100 / 12;
  const archetypeRarity = Math.max(2, baseArchetype - rarestTraits.reduce((s, t) => s + (10 - Math.min(10, t.rarity)) / 6, 0));

  // Confidence: more answered questions → more trust. Currently 100% simulated baseline.
  // When real platform data exists, blend in actual percentiles and raise confidence.
  const completeness = Math.min(1, answered / QUESTIONS.length);
  const confidence = Math.round(completeness * 0.85 * 100) / 100; // cap at 0.85 until real data available

  return {
    oneInX,
    percentile,
    globalRarity,
    countryRarity,
    continentRarity,
    traits,
    rarestTraits,
    commonTraits,
    archetype,
    archetypeRarity,
    confidence,
    modelVersion: MODEL_VERSION,
  };
}

export function formatOneInX(n: number): string {
  if (n < 1_000_000) return n.toLocaleString();
  if (n < 1_000_000_000) return (n / 1_000_000).toFixed(1) + "M";
  return (n / 1_000_000_000).toFixed(2) + "B";
}

export function getBadges(r: RarityResult): { name: string; emoji: string; desc: string }[] {
  const out: { name: string; emoji: string; desc: string }[] = [];
  if (r.percentile >= 99.9) out.push({ name: "Top 0.1%", emoji: "💎", desc: "Statistically extraordinary" });
  else if (r.percentile >= 99) out.push({ name: "Top 1%", emoji: "🏆", desc: "Rarer than 99% of people" });
  else if (r.percentile >= 90) out.push({ name: "Top 10%", emoji: "🥇", desc: "Distinctly uncommon" });
  out.push({ name: "Early Adopter", emoji: "⚡", desc: "First wave of 1 in X" });
  if (r.traits.some((t) => t.rarity < 3)) out.push({ name: "Rare Trait", emoji: "🔮", desc: "Carries an ultra-rare trait" });
  if (r.traits.find((t) => t.id === "countries" && Number(t.answerLabel) > 14)) out.push({ name: "Global Explorer", emoji: "🌐", desc: "Traveled the world" });
  return out;
}
