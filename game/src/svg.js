// svg.js — the only place that touches the SVG DOM directly: tiny helpers for
// creating elements, plus the shared shapes the scenes reuse (koi, lily, lantern).
// The SVG namespace is read from the page's own <svg> element (render.js builds
// the panels before any scene draws), so no URL string appears in the source
// and the game loads nothing over the network.
let NS = null;
function namespace() {
  if (!NS) NS = document.querySelector('svg').namespaceURI;
  return NS;
}

export function el(tag, attrs = {}, children = []) {
  const node = document.createElementNS(namespace(), tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  for (const child of children) node.appendChild(child);
  return node;
}

export function text(x, y, content, attrs = {}) {
  const node = el('text', { x, y, ...attrs });
  node.textContent = content;
  return node;
}

// A small koi fish facing left or right, drawn from ellipses and a tail path.
export function koi(x, y, scale, body, belly, facing = 1) {
  const g = el('g', { transform: `translate(${x} ${y}) scale(${facing * scale} ${scale})` });
  g.appendChild(el('path', {
    d: 'M -34 0 Q -52 -14 -58 -4 Q -52 4 -34 2 Z', fill: body, opacity: '0.9',
  }));
  g.appendChild(el('ellipse', { cx: '0', cy: '0', rx: '34', ry: '13', fill: body }));
  g.appendChild(el('ellipse', { cx: '6', cy: '4', rx: '22', ry: '8', fill: belly, opacity: '0.85' }));
  g.appendChild(el('path', { d: 'M 18 -8 Q 30 -16 34 -8 Q 30 -2 18 -2 Z', fill: body }));
  g.appendChild(el('circle', { cx: '26', cy: '-3', r: '2.4', fill: '#1c2733' }));
  g.appendChild(el('path', { d: 'M -6 -12 Q 0 -20 8 -12', stroke: belly, 'stroke-width': '3', fill: 'none', 'stroke-linecap': 'round' }));
  return g;
}

// A lily pad with an optional lotus bloom on top.
export function lilyPad(x, y, scale, padFill, bloom = null) {
  const g = el('g', { transform: `translate(${x} ${y}) scale(${scale})` });
  g.appendChild(el('path', {
    d: 'M 0 0 L 28 -16 A 33 33 0 1 0 28 16 Z', fill: padFill, stroke: '#2f7d4f', 'stroke-width': '2',
  }));
  if (bloom) {
    for (let i = 0; i < 5; i++) {
      const a = (-90 + (i - 2) * 28) * (Math.PI / 180);
      g.appendChild(el('ellipse', {
        cx: String(Math.cos(a) * 10), cy: String(-8 + Math.sin(a) * 10),
        rx: '7', ry: '12', fill: bloom, transform: `rotate(${(i - 2) * 28} 0 -8)`,
      }));
    }
    g.appendChild(el('circle', { cx: '0', cy: '-8', r: '4.5', fill: '#ffd76a' }));
  }
  return g;
}

// A stone garden lantern; lit draws a warm glow and window, unlit stays dark.
export function stoneLantern(x, y, scale, lit) {
  const g = el('g', { transform: `translate(${x} ${y}) scale(${scale})` });
  g.appendChild(el('rect', { x: '-16', y: '26', width: '32', height: '8', rx: '2', fill: '#8a8f98' }));
  g.appendChild(el('rect', { x: '-10', y: '12', width: '20', height: '14', fill: '#7c828d' }));
  g.appendChild(el('rect', { x: '-8', y: '-8', width: '16', height: '20', fill: lit ? '#ffd76a' : '#3a4150', stroke: '#5c636e', 'stroke-width': '2' }));
  if (lit) {
    g.appendChild(el('circle', { cx: '0', cy: '2', r: '14', fill: '#ffd76a', opacity: '0.25' }));
    g.appendChild(el('ellipse', { cx: '0', cy: '2', rx: '3', ry: '6', fill: '#fff3c4' }));
  }
  g.appendChild(el('path', { d: 'M -14 -8 L 0 -22 L 14 -8 Z', fill: '#6b717c' }));
  g.appendChild(el('rect', { x: '-4', y: '-28', width: '8', height: '6', rx: '2', fill: '#5c636e' }));
  return g;
}

// A paper star lantern (bakery string lights) — a small glowing bulb.
export function bulb(x, y, lit, colour = '#ffd76a') {
  const g = el('g');
  if (lit) g.appendChild(el('circle', { cx: x, cy: y, r: '11', fill: colour, opacity: '0.3' }));
  g.appendChild(el('circle', { cx: x, cy: y, r: '5', fill: lit ? colour : '#4a4f5a', stroke: '#2c313a', 'stroke-width': '1' }));
  return g;
}
