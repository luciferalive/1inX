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
};

function rarityForAnswer(q: Question, value: string | number): number {
  if (q.type === "select" && q.options) {
    const opt = q.options.find((o) => o.value === value);
    return opt?.rarity ?? 50;
  }
  if ((q.type === "number" || q.type === "slider") && q.rarityFn) {
    return Math.max(0.05, Math.min(99, q.rarityFn(Number(value))));
  }
  return 50;
}

function labelForAnswer(q: Question, value: string | number): string {
  if (q.type === "select" && q.options) {
    return q.options.find((o) => o.value === value)?.label ?? String(value);
  }
  return `${value}${q.unit ? " " + q.unit : ""}`;
}

function pickArchetype(answers: Answers, traits: TraitResult[]): Archetype {
  // Heuristic scoring across 12 archetypes.
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

  // Weight by trait rarity bonus
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

export function calculateRarity(answers: Answers): RarityResult {
  const traits: TraitResult[] = [];
  let logSum = 0;

  for (const q of QUESTIONS) {
    if (answers[q.id] === undefined || answers[q.id] === "") continue;
    const r = rarityForAnswer(q, answers[q.id]);
    traits.push({
      id: q.id,
      label: q.label,
      category: q.category,
      answerLabel: labelForAnswer(q, answers[q.id]),
      rarity: r,
    });
    // Dampen multiplication: take log and apply a correlation factor
    logSum += Math.log(Math.max(0.5, r) / 100);
  }

  // Apply dampening factor — traits are correlated, so don't multiply naively
  const dampened = logSum * 0.35;
  const globalRarity = Math.max(0.000001, Math.min(50, Math.exp(dampened) * 100));
  const oneInX = Math.round(100 / globalRarity);
  const percentile = Math.max(0, Math.min(99.9999, 100 - globalRarity));

  const sorted = [...traits].sort((a, b) => a.rarity - b.rarity);
  const rarestTraits = sorted.slice(0, 3);
  const commonTraits = sorted.slice(-3).reverse();

  const archetype = pickArchetype(answers, traits);
  // Archetype rarity = 1/12 baseline adjusted by trait extremity
  const baseArchetype = 100 / 12;
  const archetypeRarity = Math.max(1.5, baseArchetype - rarestTraits.reduce((s, t) => s + (10 - Math.min(10, t.rarity)) / 6, 0));

  return {
    oneInX,
    percentile,
    globalRarity,
    countryRarity: Math.max(0.0001, globalRarity * 8),
    continentRarity: Math.max(0.0001, globalRarity * 3),
    traits,
    rarestTraits,
    commonTraits,
    archetype,
    archetypeRarity,
  };
}

export function formatOneInX(n: number): string {
  if (n < 1000) return n.toLocaleString();
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
  if (r.traits.some((t) => t.rarity < 1)) out.push({ name: "Rare Trait", emoji: "🔮", desc: "Carries an ultra-rare trait" });
  if (r.traits.find((t) => t.id === "countries" && Number(t.answerLabel) > 14)) out.push({ name: "Global Explorer", emoji: "🌐", desc: "Traveled the world" });
  return out;
}
