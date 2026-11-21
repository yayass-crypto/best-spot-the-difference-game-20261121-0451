// config.js — one place for every number that tunes Twin Lanterns:
// scenes, timers, scoring, sizes. Nothing here draws or listens.
export const PANEL_W = 560;
export const PANEL_H = 420;
export const MARKER_R = 26;
export const HIT_R = 34;

export const SCORE = {
  find: 100,          // base points per difference found
  comboStep: 25,      // extra points per step of the current combo
  hintCost: 25,       // points a hint costs
  wrongCost: 10,      // points a wrong click costs
  wrongTime: 3,       // seconds a wrong click costs
  winBonusPerSecond: 5, // points per second left when a scene is cleared
};

export const HINTS_PER_SCENE = 3;
export const COMBO_WINDOW_MS = 8000; // a find within this of the last keeps the combo

// Scene order, difficulty and time limits. The scenes themselves live in scenes.js.
export const SCENE_ORDER = ['koi-pond', 'starlight-bakery', 'clockmaker'];
export const SCENE_TIME = { 'koi-pond': 150, 'starlight-bakery': 120, 'clockmaker': 100 };

export const STARS = [
  { secondsLeft: 60, stars: 3 },
  { secondsLeft: 25, stars: 2 },
  { secondsLeft: 0, stars: 1 },
];

export function starsFor(secondsLeft) {
  for (const band of STARS) if (secondsLeft >= band.secondsLeft) return band.stars;
  return 1;
}
