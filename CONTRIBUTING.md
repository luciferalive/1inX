# Contributing to 1 in X

Thanks for helping make this better! Every contribution counts, from fixing a typo to adding a whole feature.

## Quick start

```bash
git clone https://github.com/<your-username>/1inX.git   # your fork
cd 1inX
npm install
cp .env.example .env     # add your own Supabase values
npm run dev
```

You can work on the scoring and the demo **without any backend**:

```bash
node scripts/build-demo.mjs          # rebuild docs/index.html
node scripts/check-demo-parity.mjs   # demo must match the real engine (Node 22.18+)
```

Open `docs/index.html` in a browser to try your changes.

## Easy ways to contribute

| Idea | Where |
|---|---|
| Improve a rarity % (please cite a source in the PR) | `src/lib/rarity/questions.ts` |
| Add a question | `src/lib/rarity/questions.ts` |
| Add or tweak an archetype | `src/lib/rarity/archetypes.ts` and the scoring in `engine.ts` |
| Improve the UI | `src/routes/` and `src/components/` |
| Fix wording, docs, typos | anywhere |

After touching `questions.ts`, `archetypes.ts` or `engine.ts`, run the two `node scripts/...` commands above and
commit the regenerated `docs/index.html`. **If you change the scoring in `engine.ts`, mirror it in
`scripts/demo-template.html`**, and the parity check will tell you if they disagree.

## Pull request flow

1. Fork the repo and create a branch (`git checkout -b better-eye-color-stats`).
2. Keep each PR focused on one idea.
3. Run `npm run lint` and `npm run format` if you changed app code.
4. Open a PR and fill in the template. Don't worry about perfection; we'll iterate together.

## Guidelines

- **Never commit secrets.** Only the public Supabase keys belong in `.env`; the service role key must never
  be committed.
- Rarity numbers should be defensible. Link a source when you change one.
- Be kind. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Not sure where to start?

Open an issue and say hi, or look for **good first issue**.
