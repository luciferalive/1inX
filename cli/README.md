# 1inx — how rare are you, really?

A tiny terminal tool. Answer a few questions and get your **1 in X** rarity score, percentile,
archetype and rarest traits. No accounts, no internet, no dependencies.

```text
✨ Your result

   You are  1 in 68,711
   Rarer than 99.97% of people
   ████████████████████████████████

   🌍  Global Deal Maker  — Borders bend around you.
   Strengths: Negotiation, Cross-cultural fluency, Network instinct

   Your rarest traits
   • Eye color: Green (2% of people)
```

## Run it

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
# from a clone of this repo
node cli/bin/1inx.mjs

# or install it as a command (from the cli/ folder)
cd cli && npm install -g .
1inx
```

## Options

| Command | What it does |
|---|---|
| `1inx` | Answer all 27 questions |
| `1inx --quick` | Answer just 12 key questions |
| `1inx --answers me.json` | Skip the questions and read answers from a file (`-` = stdin) |
| `1inx --json` | Print the result as JSON |
| `1inx --list-questions` | Show every question id and its allowed answers |
| `1inx --no-color` | Plain text output |

While answering, press **Enter** to skip a question or **q** to finish early.
See [`examples/sample-answers.json`](examples/sample-answers.json) for the answers-file format.

## Use it in scripts

```bash
node cli/bin/1inx.mjs --answers cli/examples/sample-answers.json --json
```

---

Part of [1inX](https://github.com/luciferalive/1inX). MIT licensed. This is a fun estimate based on
simplified global statistics, not science.
