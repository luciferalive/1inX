import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { calculateRarity } from "@/lib/rarity/engine";
import { ResultsView } from "./results";

export const Route = createFileRoute("/sample")({
  head: () => ({
    meta: [
      { title: "Sample Results — 1 in X" },
      { name: "description", content: "See what your 1 in X results page looks like." },
    ],
  }),
  component: Sample,
});

const SAMPLE: Record<string, string | number> = {
  age: 29, gender: "female", continent: "europe", height: 172, eyes: "green", hand: "left",
  education: "master", languages: 4, industry: "tech", income: "120_250", business: "side",
  fitness: 5, gaming: 4, reading: 22, smoking: "never", sleep: "owl",
  countries: 28, coding: "expert", swim: "yes", instruments: 2, speaking: 9,
  ai: "power", social: 2, intro: 7, leader: 9, creative: 9, risk: 8,
};

function Sample() {
  const result = useMemo(() => calculateRarity(SAMPLE), []);
  return <ResultsView result={result} username="shadowfox" tier="free" />;
}
