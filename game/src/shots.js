// shots.js — deterministic states for the screenshots, driven by the URL:
//   ?shot=start          title screen over the koi pond
//   ?shot=play&found=3   mid-game: the first 3 differences already ringed,
//                        the counter reading "3 found — 5 remain"
//   ?shot=scene2&found=2 the bakery, mid-game with 2 found
//   ?shot=win            the clockmaker's scene-win card with three stars
// Nothing here is reachable from normal play; it only stages a honest frame
// of the game's own code for the screenshots the bounty asks for.
import * as render from './render.js';
import { SCENES } from './scenes.js';
import { SCENE_ORDER } from './config.js';

export function applyShotMode(state, actions) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return;
  const foundCount = Math.max(0, Math.min(8, Number(params.get('found') || '3')));

  if (shot === 'start') {
    // Title screen over scene 1, as boot() already staged it.
    return;
  }

  if (shot === 'play' || shot === 'scene2') {
    const index = shot === 'scene2' ? 1 : 0;
    actions.startScene(index);
    const scene = SCENES[SCENE_ORDER[index]];
    state.found = new Set(scene.differences.slice(0, foundCount).map((d) => d.id));
    scene.differences.slice(0, foundCount).forEach((diff, i) => render.markFound(diff, i + 1));
    state.score = foundCount * 100;
    state.timeLeftMs = Math.floor(scene.timeLimit * 0.62 * 1000);
    render.updateHud(state);
    return;
  }

  if (shot === 'win') {
    actions.startScene(2);
    const scene = SCENES[SCENE_ORDER[2]];
    state.found = new Set(scene.differences.map((d) => d.id));
    scene.differences.forEach((diff, i) => render.markFound(diff, i + 1));
    state.score = 2400;
    state.timeLeftMs = 68 * 1000;
    render.updateHud(state);
    actions.sceneWin();
  }
}
