// Demo leaderboard/discover entries. Marked as seed so they can be replaced
// transparently as real users join. Deterministic — same order every render.

import { ARCHETYPES } from "./rarity/archetypes";

export type SeedEntry = {
  user_id: string;
  username: string;
  display_name: string | null;
  country: string;
  archetype_key: string;
  one_in_x: number;
  percentile: number;
  followers_count: number;
  likes_count: number;
  seed: true;
};

const NAMES = [
  "shadowfox","auroramind","quietstorm","neonpulse","ironpoet","velvetorbit","crimsonsage","kaiwave",
  "lunarflux","midnightmoss","sablecode","emberwitch","glacialhart","ravenink","prismfox","echonebula",
  "skywarden","wolfether","obsidianowl","sunderhart","cinderhusk","tundraflame","driftnova","silverwake",
  "nightbloom","onyxquill","grimspark","feralsage","celestialink","ironpetal","violetashes","dustwarden",
  "haloseed","ghostgrid","brassfox","quasarlee","stormeden","mosswraith","pyrequill","duskforge",
  "polarcoin","steelhart","vesperloom","wraithcode","oakenharbor","saltveil","stormhart","amberkite",
  "ferncipher","glacierowl","ironorchid","tidemind","novahart","cobaltlark","sablefable","myrrhsong",
  "vexedmuse","pinekoda","ashenwave","granitehowl","loomedlumen","oxidehart","mirrorfern","driftpilot",
  "voltquill","seraphloop","brindlefox","obscuralumen","emberbloom","duskmonarch","penumbroot","crowforge",
  "polarisleo","quillvane","ravineecho","sablehowl","threshvale","umbraloom","verdantfox","whorlquill",
  "xenokite","yarnstorm","zephyrcode","amberglide","blueloop","cinderfern","driftroot","echovault",
  "ferraloom","glimmerhart","halcyonfox","ironloom","jadewraith","kindlehart","luminoth","mossvane",
  "nightfern","onyxwake","pyrekind","quietflux",
];

const COUNTRIES = [
  "United States","India","Brazil","Germany","Japan","Canada","United Kingdom","France","Australia","Nigeria",
  "South Korea","Mexico","Indonesia","Italy","Spain","Sweden","Netherlands","South Africa","Argentina","Vietnam",
  "Poland","Turkey","Egypt","Philippines","Thailand","Ireland","Norway","Singapore","UAE","Portugal",
];

const ARCH_KEYS = Object.keys(ARCHETYPES);

// Simple seeded RNG so the list is deterministic.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let cache: SeedEntry[] | null = null;

export function getSeedEntries(): SeedEntry[] {
  if (cache) return cache;
  const rng = mulberry32(13371337);
  const list: SeedEntry[] = NAMES.map((username, i) => {
    // produce skewed-toward-rare 1-in-X values
    const r = rng();
    const oneInX = Math.round(50 + Math.pow(r, 2.4) * 250_000);
    const percentile = 100 - 100 / oneInX;
    return {
      user_id: `seed_${i}`,
      username,
      display_name: null,
      country: COUNTRIES[Math.floor(rng() * COUNTRIES.length)],
      archetype_key: ARCH_KEYS[Math.floor(rng() * ARCH_KEYS.length)],
      one_in_x: oneInX,
      percentile,
      followers_count: Math.floor(rng() * 2400),
      likes_count: Math.floor(rng() * 8400),
      seed: true,
    };
  });
  // sort by rarity (highest 1-in-X first)
  list.sort((a, b) => b.one_in_x - a.one_in_x);
  cache = list;
  return list;
}

export function getSeedLeaderboard(limit = 50) {
  return getSeedEntries().slice(0, limit).map((e) => ({
    user_id: e.user_id,
    one_in_x: e.one_in_x,
    percentile: e.percentile,
    archetype_key: e.archetype_key,
    created_at: new Date().toISOString(),
    profiles: {
      username: e.username,
      display_name: e.display_name,
      avatar_url: null,
      country: e.country,
    },
    seed: true,
  }));
}

export function getSeedDiscover(limit = 24) {
  return getSeedEntries().slice(0, limit).map((e) => ({
    username: e.username,
    display_name: e.display_name,
    avatar_url: null,
    country: e.country,
    followers_count: e.followers_count,
    likes_count: e.likes_count,
    seed: true,
  }));
}
