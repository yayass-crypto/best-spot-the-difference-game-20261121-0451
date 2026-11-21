// scenes.js — the three original scenes. Each scene draws itself into an <svg>
// for one side ('left' = the original, 'right' = the changed twin) and names
// its differences with the exact spot a marker belongs. No scene copies any
// commercial game, picture or character: the pond, the bakery and the workshop
// are drawn here from shapes, in this file.
import { el, text, koi, lilyPad, stoneLantern, bulb } from './svg.js';

function defs(svg, id, stops) {
  const def = el('defs');
  const grad = el('linearGradient', { id, x1: '0', y1: '0', x2: '0', y2: '1' });
  for (const [offset, colour] of stops) {
    grad.appendChild(el('stop', { offset, 'stop-color': colour }));
  }
  def.appendChild(grad);
  svg.appendChild(def);
  return `url(#${id})`;
}

// ---------------------------------------------------------------- koi pond
function drawKoiPond(svg, side) {
  const right = side === 'right';
  const sky = defs(svg, `koi-sky-${side}`, [['0', '#2b2350'], ['0.55', '#7a4a7e'], ['1', '#e08a5a']]);
  svg.appendChild(el('rect', { x: '0', y: '0', width: '560', height: '250', fill: sky }));
  // Stars.
  for (const [x, y, r] of [[40, 40, 1.6], [120, 28, 1.3], [200, 52, 1.6], [330, 30, 1.3], [410, 44, 1.6], [540, 90, 1.3], [90, 80, 1.2], [250, 24, 1.2]]) {
    svg.appendChild(el('circle', { cx: x, cy: y, r, fill: '#fff8e0', opacity: '0.9' }));
  }
  // Moon: full on the left, a crescent on the right. (Difference 1.)
  svg.appendChild(el('circle', { cx: '478', cy: '58', r: '26', fill: '#ffeec2' }));
  svg.appendChild(el('circle', { cx: '478', cy: '58', r: '22', fill: '#ffeec2', opacity: '0.35' }));
  if (right) svg.appendChild(el('circle', { cx: '490', cy: '52', r: '22', fill: '#3a2f63' }));
  // Distant hills and the bank.
  svg.appendChild(el('path', { d: 'M 0 250 L 0 210 Q 140 170 280 205 Q 420 175 560 210 L 560 250 Z', fill: '#3d5a3a' }));
  svg.appendChild(el('rect', { x: '0', y: '248', width: '560', height: '172', fill: '#2e4a2c' }));
  // The pond.
  const water = defs(svg, `koi-water-${side}`, [['0', '#3f7d8c'], ['1', '#1f4d63']]);
  svg.appendChild(el('ellipse', { cx: '280', cy: '335', rx: '265', ry: '82', fill: water, stroke: '#7fb3a8', 'stroke-width': '2' }));
  // Moonlight on the water.
  svg.appendChild(el('ellipse', { cx: '470', cy: '330', rx: '46', ry: '9', fill: '#ffeec2', opacity: '0.25' }));
  // Wooden bridge over the pond's far edge.
  svg.appendChild(el('path', { d: 'M 170 252 Q 280 196 390 252 L 390 262 Q 280 206 170 262 Z', fill: '#7a5230' }));
  for (let i = 0; i < 5; i++) {
    // Difference 6: the middle plank is missing on the right.
    if (right && i === 2) continue;
    const x = 196 + i * 36;
    svg.appendChild(el('rect', { x, y: '222', width: '30', height: '12', rx: '2', fill: '#a9713f', stroke: '#5f3d1e', 'stroke-width': '1' }));
  }
  svg.appendChild(el('path', { d: 'M 176 250 Q 280 200 384 250', stroke: '#5f3d1e', 'stroke-width': '3', fill: 'none' }));
  // Stone lantern on the left bank. (Difference 4: lit / unlit.)
  svg.appendChild(stoneLantern(78, 210, 1, !right));
  // Reeds on the left bank. (Difference 8: three stalks / two.)
  const reedXs = right ? [44, 66] : [44, 60, 78];
  for (const x of reedXs) {
    svg.appendChild(el('path', { d: `M ${x} 400 Q ${x - 4} 350 ${x + 2} 316`, stroke: '#4d8a4f', 'stroke-width': '4', fill: 'none', 'stroke-linecap': 'round' }));
    svg.appendChild(el('ellipse', { cx: x + 2, cy: '312', rx: '4', ry: '10', fill: '#6b4a2f' }));
  }
  // Koi. (Difference 2: the white koi swims away on the right.)
  svg.appendChild(koi(300, 335, 1, '#e8833a', '#ffd9a0', 1));
  if (!right) svg.appendChild(koi(180, 355, 0.85, '#f2ead8', '#e8833a', -1));
  svg.appendChild(koi(420, 352, 0.9, '#e8833a', '#fff3c4', -1));
  // Lily pads. (Difference 3: the lotus bloom is pink / white. Difference 5: an extra pad on the right.)
  svg.appendChild(lilyPad(140, 298, 1, '#3f8f5f', right ? '#f5f0e6' : '#e87aa0'));
  svg.appendChild(lilyPad(380, 300, 0.9, '#3f8f5f'));
  svg.appendChild(lilyPad(250, 372, 0.8, '#35794f'));
  if (right) svg.appendChild(lilyPad(440, 318, 0.7, '#3f8f5f'));
  // Fireflies. (Difference 7: one firefly is missing on the right.)
  const flies = [[500, 140], [522, 178], [60, 118], [104, 88], [462, 96]];
  for (const [x, y] of flies) {
    if (right && x === 500) continue;
    svg.appendChild(el('circle', { cx: x, cy: y, r: '6', fill: '#ffe27a', opacity: '0.3' }));
    svg.appendChild(el('circle', { cx: x, cy: y, r: '2.6', fill: '#ffe27a' }));
  }
  svg.appendChild(text(16, 404, 'Koi Pond at Dusk', { fill: '#dcefe0', 'font-size': '13', 'font-style': 'italic', opacity: '0.75' }));
}

const KOI_DIFFS = [
  { id: 'moon', x: 478, y: 58, label: 'The moon is full — or is it a crescent?' },
  { id: 'white-koi', x: 180, y: 355, label: 'A white koi has swum away' },
  { id: 'lotus', x: 140, y: 292, label: 'The lotus changed colour' },
  { id: 'lantern', x: 78, y: 210, label: 'The stone lantern went dark' },
  { id: 'extra-lily', x: 440, y: 318, label: 'An extra lily pad appeared' },
  { id: 'plank', x: 300, y: 228, label: 'A bridge plank is missing' },
  { id: 'firefly', x: 500, y: 140, label: 'A firefly has gone out' },
  { id: 'reeds', x: 60, y: 340, label: 'One reed is missing' },
];

// ------------------------------------------------------- starlight bakery
function drawBakery(svg, side) {
  const right = side === 'right';
  const wall = defs(svg, `bake-wall-${side}`, [['0', '#f7e3c2'], ['1', '#e8c491']]);
  svg.appendChild(el('rect', { x: '0', y: '0', width: '560', height: '420', fill: wall }));
  // Sign with a star. (Difference 2: the star is gold / red.)
  svg.appendChild(el('rect', { x: '150', y: '14', width: '260', height: '40', rx: '8', fill: '#5b3a29' }));
  svg.appendChild(el('path', { d: 'M 280 20 L 283 28 L 292 28 L 285 33 L 287 42 L 280 37 L 273 42 L 275 33 L 268 28 L 277 28 Z', fill: right ? '#d95f4b' : '#ffd76a' }));
  svg.appendChild(text(158, 42, 'STARLIGHT', { fill: '#ffeec2', 'font-size': '15', 'font-weight': '700', 'letter-spacing': '2' }));
  svg.appendChild(text(300, 42, 'BAKERY', { fill: '#ffeec2', 'font-size': '15', 'font-weight': '700', 'letter-spacing': '2' }));
  // Awning. (Difference 5: one stripe is red / teal.)
  for (let i = 0; i < 8; i++) {
    const x = 40 + i * 60;
    const stripe = (right && i === 1) ? '#3f8f8a' : (i % 2 ? '#f2ead8' : '#d95f4b');
    svg.appendChild(el('path', { d: `M ${x} 66 L ${x + 60} 66 L ${x + 60} 96 Q ${x + 30} 108 ${x} 96 Z`, fill: stripe, stroke: '#8a5a3a', 'stroke-width': '1' }));
  }
  // Shop window.
  svg.appendChild(el('rect', { x: '56', y: '110', width: '448', height: '190', rx: '6', fill: '#7a4a2b', stroke: '#5b3a29', 'stroke-width': '4' }));
  svg.appendChild(el('rect', { x: '66', y: '120', width: '428', height: '170', fill: '#ffe9b8' }));
  // Shelf with cakes. (Difference 3: the cake has three layers / two.)
  svg.appendChild(el('rect', { x: '86', y: '238', width: '180', height: '8', fill: '#8a5a3a' }));
  svg.appendChild(el('ellipse', { cx: '176', cy: '238', rx: '52', ry: '7', fill: '#f2ead8' }));
  const layers = right ? [0, 1] : [0, 1, 2];
  for (const i of layers) {
    svg.appendChild(el('rect', { x: '140', y: String(196 - i * 14), width: '72', height: '14', fill: i % 2 ? '#e87aa0' : '#fff3c4', stroke: '#c98a6a', 'stroke-width': '1' }));
  }
  svg.appendChild(el('circle', { cx: '176', cy: String(right ? 178 : 164), r: '4', fill: '#d95f4b' }));
  // Jars on the right shelf. (Difference 4: three jars / two.)
  svg.appendChild(el('rect', { x: '330', y: '238', width: '140', height: '8', fill: '#8a5a3a' }));
  const jars = right ? [350, 400] : [350, 400, 450];
  for (const x of jars) {
    svg.appendChild(el('rect', { x, y: '196', width: '34', height: '42', rx: '6', fill: '#d9a05b', stroke: '#8a5a3a', 'stroke-width': '2' }));
    svg.appendChild(el('rect', { x: x + 4, y: '190', width: '26', height: '8', rx: '3', fill: '#5b3a29' }));
  }
  // Wall clock. (Difference 6: the hands read 7:00 / 9:00.)
  svg.appendChild(el('circle', { cx: '480', cy: '140', r: '24', fill: '#fff8e0', stroke: '#5b3a29', 'stroke-width': '3' }));
  svg.appendChild(el('line', { x1: '480', y1: '140', x2: '480', y2: '122', stroke: '#3a2a1a', 'stroke-width': '3', 'stroke-linecap': 'round' }));
  svg.appendChild(el('line', { x1: '480', y1: '140', x2: right ? '462' : '492', y2: '140', stroke: '#3a2a1a', 'stroke-width': '3', 'stroke-linecap': 'round' }));
  svg.appendChild(el('circle', { cx: '480', cy: '140', r: '3', fill: '#d95f4b' }));
  // String lights under the awning. (Difference 8: one bulb is out on the right.)
  svg.appendChild(el('path', { d: 'M 60 96 Q 280 128 500 96', stroke: '#5b3a29', 'stroke-width': '2', fill: 'none' }));
  for (const x of [120, 200, 280, 360, 440]) {
    svg.appendChild(bulb(x, 104, !(right && x === 360)));
  }
  // Counter with a tray of croissants. (Difference 7: three croissants / two.)
  svg.appendChild(el('rect', { x: '40', y: '316', width: '480', height: '104', fill: '#8a5a3a' }));
  svg.appendChild(el('rect', { x: '40', y: '316', width: '480', height: '10', fill: '#a9713f' }));
  svg.appendChild(el('ellipse', { cx: '180', cy: '356', rx: '86', ry: '12', fill: '#d9d9d9' }));
  const croissants = right ? [150, 200] : [140, 180, 220];
  for (const x of croissants) {
    svg.appendChild(el('path', { d: `M ${x - 18} 352 Q ${x} 326 ${x + 18} 352 Q ${x} 360 ${x - 18} 352 Z`, fill: '#e8a54b', stroke: '#b97a2e', 'stroke-width': '1.5' }));
  }
  // Teapot on the counter.
  svg.appendChild(el('ellipse', { cx: '420', cy: '352', rx: '30', ry: '20', fill: '#3f8f8a' }));
  svg.appendChild(el('path', { d: 'M 420 332 Q 420 318 432 322', stroke: '#3f8f8a', 'stroke-width': '6', fill: 'none', 'stroke-linecap': 'round' }));
  svg.appendChild(el('path', { d: 'M 392 344 Q 380 344 384 356', stroke: '#3f8f8a', 'stroke-width': '5', fill: 'none', 'stroke-linecap': 'round' }));
  // The shop cat on the counter. (Difference 1: the cat is napping / gone.)
  if (!right) {
    const cat = el('g', { transform: 'translate(92 318)' });
    cat.appendChild(el('ellipse', { cx: '0', cy: '0', rx: '26', ry: '16', fill: '#3a3a3a' }));
    cat.appendChild(el('circle', { cx: '20', cy: '-12', r: '11', fill: '#3a3a3a' }));
    cat.appendChild(el('path', { d: 'M 12 -20 L 14 -30 L 20 -21 Z M 24 -21 L 28 -30 L 30 -20 Z', fill: '#3a3a3a' }));
    cat.appendChild(el('path', { d: 'M -24 4 Q -40 -8 -34 -22', stroke: '#3a3a3a', 'stroke-width': '5', fill: 'none', 'stroke-linecap': 'round' }));
    cat.appendChild(el('path', { d: 'M 16 -12 Q 20 -10 24 -12', stroke: '#f2ead8', 'stroke-width': '1.5', fill: 'none' }));
    svg.appendChild(cat);
  }
  svg.appendChild(text(16, 404, 'The Starlight Bakery', { fill: '#5b3a29', 'font-size': '13', 'font-style': 'italic', opacity: '0.75' }));
}

const BAKERY_DIFFS = [
  { id: 'cat', x: 92, y: 312, label: 'The shop cat has wandered off' },
  { id: 'sign-star', x: 280, y: 31, label: 'The sign star changed colour' },
  { id: 'cake', x: 176, y: 200, label: 'The cake lost a layer' },
  { id: 'jars', x: 450, y: 215, label: 'A jam jar is missing' },
  { id: 'awning', x: 130, y: 84, label: 'An awning stripe changed colour' },
  { id: 'clock', x: 480, y: 140, label: 'The wall clock shows another hour' },
  { id: 'croissant', x: 220, y: 344, label: 'A croissant was eaten' },
  { id: 'bulb', x: 360, y: 104, label: 'A string-light bulb went out' },
];

// -------------------------------------------------- clockmaker's workshop
function gear(cx, cy, r, teeth, fill, missingTooth = -1) {
  const g = el('g');
  for (let i = 0; i < teeth; i++) {
    if (i === missingTooth) continue;
    const a = (i / teeth) * Math.PI * 2;
    const x1 = cx + Math.cos(a) * (r - 2);
    const y1 = cy + Math.sin(a) * (r - 2);
    const x2 = cx + Math.cos(a) * (r + 9);
    const y2 = cy + Math.sin(a) * (r + 9);
    g.appendChild(el('line', { x1, y1, x2, y2, stroke: fill, 'stroke-width': '7', 'stroke-linecap': 'round' }));
  }
  g.appendChild(el('circle', { cx, cy, r, fill, stroke: '#5b4632', 'stroke-width': '2' }));
  g.appendChild(el('circle', { cx, cy, r: r * 0.45, fill: '#f2e3c2' }));
  g.appendChild(el('circle', { cx, cy, r: '5', fill: '#5b4632' }));
  return g;
}

function drawWorkshop(svg, side) {
  const right = side === 'right';
  const wall = defs(svg, `shop-wall-${side}`, [['0', '#6b4a2f'], ['1', '#4a3220']]);
  svg.appendChild(el('rect', { x: '0', y: '0', width: '560', height: '420', fill: wall }));
  // Window with the night sky. (Difference 7: moon / star.)
  svg.appendChild(el('rect', { x: '452', y: '28', width: '84', height: '76', rx: '4', fill: '#1f2b4a', stroke: '#2e2013', 'stroke-width': '5' }));
  svg.appendChild(el('line', { x1: '494', y1: '28', x2: '494', y2: '104', stroke: '#2e2013', 'stroke-width': '4' }));
  svg.appendChild(el('line', { x1: '452', y1: '66', x2: '536', y2: '66', stroke: '#2e2013', 'stroke-width': '4' }));
  if (right) {
    svg.appendChild(el('path', { d: 'M 494 42 L 496 50 L 504 50 L 498 55 L 500 63 L 494 58 L 488 63 L 490 55 L 484 50 L 492 50 Z', fill: '#ffe27a' }));
  } else {
    svg.appendChild(el('circle', { cx: '494', cy: '52', r: '11', fill: '#ffeec2' }));
  }
  // Gears on the wall. (Difference 2: a tooth is missing. Difference 8: brass / copper.)
  svg.appendChild(gear(150, 118, 34, 10, '#c9a227', right ? 0 : -1));
  svg.appendChild(gear(352, 178, 26, 8, right ? '#b87333' : '#c9a227'));
  // Wall clock. (Difference 4: 3 o'clock / 6 o'clock.)
  svg.appendChild(el('circle', { cx: '404', cy: '96', r: '22', fill: '#fff8e0', stroke: '#2e2013', 'stroke-width': '3' }));
  svg.appendChild(el('line', { x1: '404', y1: '96', x2: '404', y2: '80', stroke: '#3a2a1a', 'stroke-width': '2.5', 'stroke-linecap': 'round' }));
  svg.appendChild(el('line', { x1: '404', y1: '96', x2: right ? '404' : '418', y2: right ? '110' : '96', stroke: '#3a2a1a', 'stroke-width': '2.5', 'stroke-linecap': 'round' }));
  svg.appendChild(el('circle', { cx: '404', cy: '96', r: '2.5', fill: '#d95f4b' }));
  // Grandfather clock with pendulum. (Difference 1: the pendulum is gone.)
  svg.appendChild(el('rect', { x: '252', y: '150', width: '56', height: '150', rx: '6', fill: '#5b3a29', stroke: '#2e2013', 'stroke-width': '3' }));
  svg.appendChild(el('circle', { cx: '280', cy: '182', r: '18', fill: '#fff8e0', stroke: '#2e2013', 'stroke-width': '2' }));
  svg.appendChild(el('line', { x1: '280', y1: '182', x2: '280', y2: '168', stroke: '#3a2a1a', 'stroke-width': '2', 'stroke-linecap': 'round' }));
  svg.appendChild(el('line', { x1: '280', y1: '182', x2: '290', y2: '182', stroke: '#3a2a1a', 'stroke-width': '2', 'stroke-linecap': 'round' }));
  if (!right) {
    svg.appendChild(el('line', { x1: '280', y1: '204', x2: '280', y2: '252', stroke: '#c9a227', 'stroke-width': '3' }));
    svg.appendChild(el('circle', { cx: '280', cy: '258', r: '10', fill: '#c9a227', stroke: '#8a6d1f', 'stroke-width': '2' }));
  }
  // Oil lamp on the bench. (Difference 3: lit / out.)
  svg.appendChild(el('ellipse', { cx: '480', cy: '300', rx: '22', ry: '8', fill: '#2e2013' }));
  svg.appendChild(el('rect', { x: '468', y: '272', width: '24', height: '26', rx: '6', fill: '#3f8f8a' }));
  if (!right) {
    svg.appendChild(el('circle', { cx: '480', cy: '262', r: '12', fill: '#ffd76a', opacity: '0.3' }));
    svg.appendChild(el('path', { d: 'M 480 252 Q 488 262 480 270 Q 472 262 480 252 Z', fill: '#ffb347' }));
  }
  // Workbench.
  svg.appendChild(el('rect', { x: '30', y: '306', width: '500', height: '114', fill: '#7a5230' }));
  svg.appendChild(el('rect', { x: '30', y: '306', width: '500', height: '10', fill: '#a9713f' }));
  // Books. (Difference 9: three books / two.)
  const books = right ? ['#3f8f8a', '#d95f4b'] : ['#3f8f8a', '#d95f4b', '#5b7ab8'];
  books.forEach((colour, i) => {
    svg.appendChild(el('rect', { x: '92', y: String(292 - i * 13), width: '58', height: '12', fill: colour, stroke: '#2e2013', 'stroke-width': '1' }));
  });
  // Tools: hammer on the left, a wrench on the right. (Difference 5.)
  if (right) {
    svg.appendChild(el('path', { d: 'M 196 372 L 226 336', stroke: '#8a8f98', 'stroke-width': '7', 'stroke-linecap': 'round' }));
    svg.appendChild(el('path', { d: 'M 224 330 A 10 10 0 1 1 234 344 L 226 342 Z', fill: '#8a8f98' }));
  } else {
    svg.appendChild(el('rect', { x: '196', y: '330', width: '8', height: '44', rx: '3', fill: '#a9713f', transform: 'rotate(24 200 352)' }));
    svg.appendChild(el('rect', { x: '190', y: '322', width: '26', height: '14', rx: '3', fill: '#8a8f98', transform: 'rotate(24 203 329)' }));
  }
  // Blueprint roll. (Difference 6: present / gone.)
  if (!right) {
    svg.appendChild(el('rect', { x: '66', y: '356', width: '70', height: '16', rx: '8', fill: '#f2ead8', stroke: '#c9b896', 'stroke-width': '1' }));
    svg.appendChild(el('circle', { cx: '70', cy: '364', r: '7', fill: '#e8dcc0', stroke: '#c9b896', 'stroke-width': '1' }));
  }
  // Pocket watch on the bench.
  svg.appendChild(el('circle', { cx: '350', cy: '352', r: '16', fill: '#ffeec2', stroke: '#c9a227', 'stroke-width': '3' }));
  svg.appendChild(el('line', { x1: '350', y1: '352', x2: '350', y2: '340', stroke: '#3a2a1a', 'stroke-width': '2', 'stroke-linecap': 'round' }));
  svg.appendChild(el('line', { x1: '350', y1: '352', x2: '360', y2: '352', stroke: '#3a2a1a', 'stroke-width': '2', 'stroke-linecap': 'round' }));
  svg.appendChild(text(16, 404, "The Clockmaker's Workshop", { fill: '#e8dcc0', 'font-size': '13', 'font-style': 'italic', opacity: '0.75' }));
}

const WORKSHOP_DIFFS = [
  { id: 'pendulum', x: 280, y: 252, label: 'The pendulum has vanished' },
  { id: 'gear-tooth', x: 150, y: 76, label: 'A gear lost a tooth' },
  { id: 'lamp', x: 480, y: 260, label: 'The oil lamp went out' },
  { id: 'wall-clock', x: 404, y: 96, label: 'The wall clock shows another hour' },
  { id: 'tool', x: 208, y: 348, label: 'The hammer became a wrench' },
  { id: 'blueprint', x: 100, y: 364, label: 'The blueprint roll is gone' },
  { id: 'window', x: 494, y: 52, label: 'The moon became a star' },
  { id: 'gear-colour', x: 352, y: 178, label: 'A gear changed metal' },
  { id: 'books', x: 121, y: 272, label: 'A book is missing from the stack' },
];

// ------------------------------------------------------------------ exports
export const SCENES = {
  'koi-pond': {
    id: 'koi-pond',
    title: 'Koi Pond at Dusk',
    subtitle: 'A quiet garden pond under a rising moon',
    timeLimit: 150,
    differences: KOI_DIFFS,
    draw: drawKoiPond,
  },
  'starlight-bakery': {
    id: 'starlight-bakery',
    title: 'The Starlight Bakery',
    subtitle: 'Warm bread, jam jars and one sleepy cat',
    timeLimit: 120,
    differences: BAKERY_DIFFS,
    draw: drawBakery,
  },
  'clockmaker': {
    id: 'clockmaker',
    title: "The Clockmaker's Workshop",
    subtitle: 'Gears, pendulums and one very old pocket watch',
    timeLimit: 100,
    differences: WORKSHOP_DIFFS,
    draw: drawWorkshop,
  },
};
