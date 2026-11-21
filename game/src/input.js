// input.js — pointer and keyboard play. A click on either panel is converted
// to scene coordinates, hit-tested against the scene's unfound differences
// (nearest within HIT_R wins), and handed to the game as found / missed.
// Keyboard: H hint, M mute, R restart, N next, 1–3 scenes, Esc menu.
import { HIT_R } from './config.js';

export function panelPoint(svg, event) {
  const rect = svg.getBoundingClientRect();
  const viewBox = svg.viewBox.baseVal;
  const scaleX = viewBox.width / rect.width;
  const scaleY = viewBox.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

export function nearestDiff(differences, found, x, y) {
  let best = null;
  let bestDist = HIT_R;
  for (const diff of differences) {
    if (found.has(diff.id)) continue;
    const dist = Math.hypot(diff.x - x, diff.y - y);
    if (dist <= bestDist) { best = diff; bestDist = dist; }
  }
  return best;
}

export function bindPanels(refs, onClick) {
  for (const svg of [refs.panelA, refs.panelB]) {
    svg.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      const point = panelPoint(svg, event);
      onClick(svg, point.x, point.y);
    });
  }
}

export function bindKeys(onKey) {
  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (['h', 'm', 'r', 'n', 'escape', '1', '2', '3', 'enter'].includes(key)) {
      onKey(key);
    }
  });
}
