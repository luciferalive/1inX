export type Question = {
  id: string;
  category: string;
  label: string;
  type: "select" | "number" | "slider";
  options?: { value: string; label: string; rarity: number }[]; // rarity = % of population with this answer (0–100)
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  /** For number/slider: rarity curve — function from value -> rarity % */
  rarityFn?: (v: number) => number;
};

// Rarity = approximate % of global population matching that answer.
// Smaller number = rarer trait.

export const QUESTIONS: Question[] = [
  // PERSONAL
  {
    id: "age", category: "Personal", label: "Your age", type: "number", min: 13, max: 110, unit: "years",
    rarityFn: (v) => (v < 18 ? 22 : v < 30 ? 20 : v < 45 ? 22 : v < 60 ? 18 : v < 75 ? 12 : 6),
  },
  {
    id: "gender", category: "Personal", label: "Gender", type: "select",
    options: [
      { value: "male", label: "Male", rarity: 49 },
      { value: "female", label: "Female", rarity: 49 },
      { value: "nonbinary", label: "Non-binary", rarity: 1.5 },
      { value: "other", label: "Prefer to self-describe", rarity: 0.5 },
    ],
  },
  {
    id: "continent", category: "Personal", label: "Continent", type: "select",
    options: [
      { value: "asia", label: "Asia", rarity: 59 },
      { value: "africa", label: "Africa", rarity: 18 },
      { value: "europe", label: "Europe", rarity: 9 },
      { value: "namerica", label: "North America", rarity: 7.5 },
      { value: "samerica", label: "South America", rarity: 5.5 },
      { value: "oceania", label: "Oceania", rarity: 0.6 },
      { value: "antarctica", label: "Antarctica", rarity: 0.001 },
    ],
  },
  {
    id: "height", category: "Personal", label: "Height", type: "number", min: 120, max: 230, unit: "cm",
    rarityFn: (v) => {
      // bell curve around 168
      const d = Math.abs(v - 168);
      return Math.max(0.2, 30 * Math.exp(-(d * d) / 200));
    },
  },
  {
    id: "eyes", category: "Personal", label: "Eye color", type: "select",
    options: [
      { value: "brown", label: "Brown", rarity: 79 },
      { value: "blue", label: "Blue", rarity: 8 },
      { value: "hazel", label: "Hazel", rarity: 5 },
      { value: "amber", label: "Amber", rarity: 5 },
      { value: "green", label: "Green", rarity: 2 },
      { value: "gray", label: "Gray", rarity: 1 },
      { value: "violet", label: "Violet / Heterochromia", rarity: 0.1 },
    ],
  },
  {
    id: "hand", category: "Personal", label: "Dominant hand", type: "select",
    options: [
      { value: "right", label: "Right", rarity: 88 },
      { value: "left", label: "Left", rarity: 10 },
      { value: "ambi", label: "Ambidextrous", rarity: 1 },
    ],
  },

  // EDUCATION
  {
    id: "education", category: "Education", label: "Highest education level", type: "select",
    options: [
      { value: "none", label: "No formal", rarity: 14 },
      { value: "primary", label: "Primary", rarity: 22 },
      { value: "secondary", label: "Secondary / High school", rarity: 36 },
      { value: "bachelor", label: "Bachelor's degree", rarity: 18 },
      { value: "master", label: "Master's degree", rarity: 7 },
      { value: "phd", label: "PhD / Doctorate", rarity: 1.1 },
    ],
  },
  {
    id: "languages", category: "Education", label: "Languages you speak fluently", type: "number", min: 1, max: 10,
    rarityFn: (v) => (v <= 1 ? 60 : v === 2 ? 30 : v === 3 ? 8 : v === 4 ? 2 : 0.4),
  },

  // CAREER
  {
    id: "industry", category: "Career", label: "Industry", type: "select",
    options: [
      { value: "tech", label: "Technology", rarity: 8 },
      { value: "finance", label: "Finance", rarity: 6 },
      { value: "healthcare", label: "Healthcare", rarity: 11 },
      { value: "education", label: "Education", rarity: 9 },
      { value: "retail", label: "Retail / Service", rarity: 18 },
      { value: "agriculture", label: "Agriculture", rarity: 26 },
      { value: "creative", label: "Arts / Creative", rarity: 3 },
      { value: "government", label: "Government", rarity: 7 },
      { value: "student", label: "Student", rarity: 8 },
      { value: "other", label: "Other", rarity: 4 },
    ],
  },
  {
    id: "income", category: "Career", label: "Annual income (USD)", type: "select",
    options: [
      { value: "u5k", label: "Under $5K", rarity: 38 },
      { value: "5_25", label: "$5K – $25K", rarity: 30 },
      { value: "25_60", label: "$25K – $60K", rarity: 17 },
      { value: "60_120", label: "$60K – $120K", rarity: 9 },
      { value: "120_250", label: "$120K – $250K", rarity: 4 },
      { value: "250_1m", label: "$250K – $1M", rarity: 1.5 },
      { value: "1m+", label: "$1M+", rarity: 0.1 },
    ],
  },
  {
    id: "business", category: "Career", label: "Do you own a business?", type: "select",
    options: [
      { value: "no", label: "No", rarity: 88 },
      { value: "side", label: "Side hustle", rarity: 8 },
      { value: "yes", label: "Yes, full-time", rarity: 3.5 },
      { value: "multi", label: "Multiple businesses", rarity: 0.5 },
    ],
  },

  // LIFESTYLE
  {
    id: "fitness", category: "Lifestyle", label: "Workouts per week", type: "number", min: 0, max: 14,
    rarityFn: (v) => (v === 0 ? 45 : v <= 2 ? 28 : v <= 4 ? 18 : v <= 6 ? 7 : 2),
  },
  {
    id: "gaming", category: "Lifestyle", label: "Hours of gaming per week", type: "number", min: 0, max: 80,
    rarityFn: (v) => (v === 0 ? 55 : v < 5 ? 25 : v < 15 ? 12 : v < 30 ? 6 : 2),
  },
  {
    id: "reading", category: "Lifestyle", label: "Books read per year", type: "number", min: 0, max: 200,
    rarityFn: (v) => (v === 0 ? 50 : v < 5 ? 30 : v < 12 ? 12 : v < 30 ? 6 : 2),
  },
  {
    id: "smoking", category: "Lifestyle", label: "Smoking", type: "select",
    options: [
      { value: "never", label: "Never", rarity: 70 },
      { value: "occasional", label: "Occasional", rarity: 12 },
      { value: "regular", label: "Regular", rarity: 18 },
    ],
  },
  {
    id: "sleep", category: "Lifestyle", label: "Typical bedtime", type: "select",
    options: [
      { value: "early", label: "Before 10pm", rarity: 15 },
      { value: "normal", label: "10pm – midnight", rarity: 55 },
      { value: "late", label: "Midnight – 2am", rarity: 22 },
      { value: "owl", label: "After 2am", rarity: 8 },
    ],
  },

  // TRAVEL
  {
    id: "countries", category: "Travel", label: "Countries visited", type: "number", min: 0, max: 200,
    rarityFn: (v) => (v <= 1 ? 60 : v < 5 ? 25 : v < 15 ? 10 : v < 30 ? 3 : v < 60 ? 1 : 0.1),
  },

  // SKILLS
  {
    id: "coding", category: "Skills", label: "Can you code?", type: "select",
    options: [
      { value: "no", label: "No", rarity: 84 },
      { value: "basic", label: "A little", rarity: 10 },
      { value: "pro", label: "Professionally", rarity: 5 },
      { value: "expert", label: "Expert / multi-language", rarity: 1 },
    ],
  },
  {
    id: "swim", category: "Skills", label: "Can you swim?", type: "select",
    options: [
      { value: "no", label: "No", rarity: 45 },
      { value: "yes", label: "Yes", rarity: 50 },
      { value: "competitive", label: "Competitive level", rarity: 5 },
    ],
  },
  {
    id: "instruments", category: "Skills", label: "Musical instruments you can play", type: "number", min: 0, max: 10,
    rarityFn: (v) => (v === 0 ? 78 : v === 1 ? 15 : v === 2 ? 5 : 2),
  },
  {
    id: "speaking", category: "Skills", label: "Comfort with public speaking", type: "slider", min: 1, max: 10,
    rarityFn: (v) => (v <= 3 ? 45 : v <= 6 ? 35 : v <= 8 ? 15 : 5),
  },

  // TECHNOLOGY
  {
    id: "ai", category: "Technology", label: "How often do you use AI tools?", type: "select",
    options: [
      { value: "never", label: "Never", rarity: 55 },
      { value: "sometimes", label: "Sometimes", rarity: 25 },
      { value: "daily", label: "Daily", rarity: 15 },
      { value: "power", label: "Power user / I build with it", rarity: 5 },
    ],
  },
  {
    id: "social", category: "Technology", label: "Social media hours per day", type: "number", min: 0, max: 16,
    rarityFn: (v) => (v === 0 ? 8 : v < 2 ? 30 : v < 5 ? 40 : v < 8 ? 15 : 7),
  },

  // PERSONALITY
  {
    id: "intro", category: "Personality", label: "Introvert ←→ Extrovert", type: "slider", min: 1, max: 10,
    rarityFn: (v) => (v <= 2 ? 10 : v <= 4 ? 25 : v <= 6 ? 35 : v <= 8 ? 22 : 8),
  },
  {
    id: "leader", category: "Personality", label: "Leadership drive", type: "slider", min: 1, max: 10,
    rarityFn: (v) => (v <= 3 ? 35 : v <= 6 ? 40 : v <= 8 ? 20 : 5),
  },
  {
    id: "creative", category: "Personality", label: "Creativity", type: "slider", min: 1, max: 10,
    rarityFn: (v) => (v <= 3 ? 25 : v <= 6 ? 45 : v <= 8 ? 22 : 8),
  },
  {
    id: "risk", category: "Personality", label: "Risk tolerance", type: "slider", min: 1, max: 10,
    rarityFn: (v) => (v <= 3 ? 40 : v <= 6 ? 40 : v <= 8 ? 15 : 5),
  },
];

export const CATEGORIES = Array.from(new Set(QUESTIONS.map((q) => q.category)));
