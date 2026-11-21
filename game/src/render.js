// render.js — builds the page's DOM once and repaints it from the game state:
// the two panels, the markers on both, the HUD (counter, timer, score, hints)
// and the title / win / results screens. It never owns game logic.
import { el } from './svg.js';
import { PANEL_W, PANEL_H, MARKER_R } from './config.js';
import { SCENES } from './scenes.js';

let refs = {};

export function buildShell() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  const header = document.createElement('header');
  header.id = 'hud';
  header.innerHTML = `
    <div class="brand"><span class="lantern">🏮</span><span class="brand-name">Twin Lanterns</span>
      <span class="brand-sub">spot the difference</span></div>
    <div class="hud-mid">
      <div class="scene-label" id="scene-label">—</div>
      <div class="counter" id="counter" role="status">Found 0 / 8 — 8 remain</div>
      <div class="timer-wrap"><div class="timer-bar" id="timer-bar"></div>
        <span class="timer-text" id="timer-text">2:30</span></div>
    </div>
    <div class="hud-right">
      <div class="score-box"><span class="score-label">Score</span><span id="score">0</span></div>
      <div class="combo" id="combo"></div>
      <button id="hint-btn" class="btn" title="Hint (H)">💡 Hint <span id="hints-left">3</span></button>
      <button id="mute-btn" class="btn small" title="Sound (M)">🔊</button>
      <button id="menu-btn" class="btn small" title="Menu (Esc)">☰</button>
    </div>`;
  const stage = document.createElement('main');
  stage.id = 'stage';
  stage.innerHTML = `
    <section class="panel" id="panel-a-wrap"><div class="panel-tag">A · Original</div>
      <svg id="panel-a" viewBox="0 0 ${PANEL_W} ${PANEL_H}" role="img" aria-label="Original picture"></svg>
      <div class="panel-caption" id="caption-a"></div></section>
    <section class="panel" id="panel-b-wrap"><div class="panel-tag">B · Twin</div>
      <svg id="panel-b" viewBox="0 0 ${PANEL_W} ${PANEL_H}" role="img" aria-label="Twin picture with differences"></svg>
      <div class="panel-caption" id="caption-b"></div></section>`;
  const footer = document.createElement('footer');
  footer.id = 'foot';
  footer.innerHTML = `
    <div class="dots" id="dots"></div>
    <div class="keys">Click a difference on either picture · <b>H</b> hint · <b>R</b> restart scene ·
      <b>N</b> next scene · <b>1–3</b> choose scene · <b>M</b> sound · <b>Esc</b> menu</div>
    <div class="toast" id="toast"></div>`;
  const overlay = document.createElement('div');
  overlay.id = 'overlay';
  app.append(header, stage, footer, overlay);
  refs = {
    sceneLabel: document.getElementById('scene-label'),
    counter: document.getElementById('counter'),
    timerBar: document.getElementById('timer-bar'),
    timerText: document.getElementById('timer-text'),
    score: document.getElementById('score'),
    combo: document.getElementById('combo'),
    hintBtn: document.getElementById('hint-btn'),
    hintsLeft: document.getElementById('hints-left'),
    muteBtn: document.getElementById('mute-btn'),
    menuBtn: document.getElementById('menu-btn'),
    panelA: document.getElementById('panel-a'),
    panelB: document.getElementById('panel-b'),
    captionA: document.getElementById('caption-a'),
    captionB: document.getElementById('caption-b'),
    dots: document.getElementById('dots'),
    toast: document.getElementById('toast'),
    overlay: document.getElementById('overlay'),
    stage,
  };
  return refs;
}

export function drawScene(scene) {
  for (const [svg, side] of [[refs.panelA, 'left'], [refs.panelB, 'right']]) {
    svg.innerHTML = '';
    scene.draw(svg, side);
  }
  refs.captionA.textContent = scene.title;
  refs.captionB.textContent = scene.title + ' — twin';
  refs.sceneLabel.textContent = `Scene ${scene.index + 1} of 3 · ${scene.title}`;
  renderDots(scene.index);
}

function renderDots(activeIndex) {
  refs.dots.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot' + (i === activeIndex ? ' active' : '') + (i < activeIndex ? ' done' : '');
    dot.textContent = ['●', '●', '●'][i];
    refs.dots.appendChild(dot);
  }
}

// A found difference gets a gold ring on BOTH panels, plus a small number.
export function markFound(diff, foundIndex) {
  for (const svg of [refs.panelA, refs.panelB]) {
    const g = el('g', { class: 'marker' });
    g.appendChild(el('circle', {
      cx: diff.x, cy: diff.y, r: MARKER_R, fill: 'none',
      stroke: '#ffd76a', 'stroke-width': '4',
    }));
    g.appendChild(el('circle', {
      cx: diff.x, cy: diff.y, r: MARKER_R - 6, fill: 'none',
      stroke: '#fff3c4', 'stroke-width': '1.5', 'stroke-dasharray': '4 4',
    }));
    const badge = el('g', { transform: `translate(${diff.x + MARKER_R - 4} ${diff.y - MARKER_R + 4})` });
    badge.appendChild(el('circle', { r: '11', fill: '#ffd76a', stroke: '#8a6d1f', 'stroke-width': '1.5' }));
    const label = el('text', { y: '4', 'text-anchor': 'middle', 'font-size': '12', 'font-weight': '700', fill: '#3a2a1a' });
    label.textContent = String(foundIndex);
    badge.appendChild(label);
    g.appendChild(badge);
    svg.appendChild(g);
  }
}

// A wrong click flashes a red X on the panel that was clicked.
export function markMiss(svg, x, y) {
  const g = el('g', { class: 'miss' });
  g.appendChild(el('line', { x1: x - 12, y1: y - 12, x2: x + 12, y2: y + 12, stroke: '#ff6b5e', 'stroke-width': '5', 'stroke-linecap': 'round' }));
  g.appendChild(el('line', { x1: x + 12, y1: y - 12, x2: x - 12, y2: y + 12, stroke: '#ff6b5e', 'stroke-width': '5', 'stroke-linecap': 'round' }));
  svg.appendChild(g);
  setTimeout(() => g.remove(), 700);
}

// A hint pulses a gold ring around an unfound difference on both panels.
export function pulseHint(diff) {
  for (const svg of [refs.panelA, refs.panelB]) {
    const ring = el('circle', {
      class: 'hint-ring', cx: diff.x, cy: diff.y, r: MARKER_R + 4,
      fill: 'none', stroke: '#ffd76a', 'stroke-width': '4',
    });
    svg.appendChild(ring);
    setTimeout(() => ring.remove(), 2000);
  }
}

export function updateHud(state) {
  const total = state.scene.differences.length;
  const found = state.found.size;
  const remain = total - found;
  refs.counter.textContent = `Found ${found} / ${total} — ${remain} remain`;
  refs.counter.classList.toggle('done', remain === 0);
  refs.score.textContent = state.score.toLocaleString('en-US');
  refs.hintsLeft.textContent = String(state.hintsLeft);
  refs.hintBtn.disabled = state.hintsLeft <= 0 || state.phase !== 'playing';
  const seconds = Math.max(0, Math.ceil(state.timeLeftMs / 1000));
  refs.timerText.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const frac = state.timeLeftMs / (state.scene.timeLimit * 1000);
  refs.timerBar.style.width = `${Math.max(0, frac * 100)}%`;
  refs.timerBar.classList.toggle('low', frac < 0.25);
  refs.combo.textContent = state.combo > 1 ? `🔥 Combo ×${state.combo}` : '';
}

export function showToast(message) {
  refs.toast.textContent = message;
  refs.toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => refs.toast.classList.remove('show'), 2200);
}

export function showTitle(bestScore) {
  refs.overlay.innerHTML = `
    <div class="card title-card">
      <div class="card-lantern">🏮 🏮</div>
      <h1>Twin Lanterns</h1>
      <p class="tagline">Two pictures hang side by side. They look the same —<br>
        but the twin is hiding <b>${SCENES['koi-pond'].differences.length + SCENES['starlight-bakery'].differences.length + SCENES['clockmaker'].differences.length} differences</b> across three scenes.</p>
      <p class="how">Click every difference you spot, on either picture. A gold ring marks each find.
        Wrong clicks cost points and seconds; hints cost a little too. Beat the clock to earn stars.</p>
      <div class="scene-list">
        ${Object.values(SCENES).map((s, i) => `
          <button class="scene-pick" data-scene="${s.id}">
            <span class="scene-num">${i + 1}</span>
            <span class="scene-name">${s.title}</span>
            <span class="scene-meta">${s.differences.length} differences · ${Math.floor(s.timeLimit / 60)}:${String(s.timeLimit % 60).padStart(2, '0')}</span>
          </button>`).join('')}
      </div>
      <button class="btn big" id="play-btn">▶ Play — Koi Pond at Dusk</button>
      ${bestScore > 0 ? `<p class="best">Best score so far: <b>${bestScore.toLocaleString('en-US')}</b></p>` : ''}
      <p class="credit">An original game — every picture drawn by hand in code. No two lanterns alike.</p>
    </div>`;
  refs.overlay.classList.add('show');
}

export function showSceneWin(scene, stars, secondsLeft, bonus, totalScore) {
  refs.overlay.innerHTML = `
    <div class="card">
      <div class="card-lantern">✨</div>
      <h2>Scene complete!</h2>
      <p class="tagline">${scene.title} — every difference found.</p>
      <div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
      <p class="how">Time to spare: <b>${secondsLeft}s</b> · Time bonus: <b>+${bonus}</b></p>
      <p class="best">Total score: <b>${totalScore.toLocaleString('en-US')}</b></p>
      <button class="btn big" id="next-btn">Next scene →</button>
      <button class="btn" id="replay-btn">↻ Replay this scene</button>
    </div>`;
  refs.overlay.classList.add('show');
}

export function showPaused(scene, found, total) {
  refs.overlay.innerHTML = `
    <div class="card">
      <div class="card-lantern">⏸</div>
      <h2>Paused</h2>
      <p class="tagline">${scene.title} — ${found} of ${total} differences found so far.</p>
      <p class="how">Take a breath. The twin isn't going anywhere.</p>
      <button class="btn big" id="resume-btn">▶ Resume</button>
      <button class="btn" id="restart-btn">↻ Restart this scene</button>
      <button class="btn" id="menu4-btn">☰ Back to menu</button>
    </div>`;
  refs.overlay.classList.add('show');
}

export function showTimeUp(scene, found, total) {
  refs.overlay.innerHTML = `
    <div class="card">
      <div class="card-lantern">⏰</div>
      <h2>Time's up!</h2>
      <p class="tagline">You found <b>${found} of ${total}</b> differences in ${scene.title}.</p>
      <p class="how">The twin keeps its secrets — for now. Try again and look closer:
        the small things change first.</p>
      <button class="btn big" id="retry-btn">↻ Try this scene again</button>
      <button class="btn" id="menu2-btn">☰ Back to menu</button>
    </div>`;
  refs.overlay.classList.add('show');
}

export function showResults(results, totalScore) {
  const rows = results.map((r) => `
    <div class="result-row"><span>${r.scene.title}</span>
      <span class="stars small">${'★'.repeat(r.stars)}${'☆'.repeat(3 - r.stars)}</span>
      <span>${r.found}/${r.total} found · ${r.secondsLeft}s left</span></div>`).join('');
  refs.overlay.innerHTML = `
    <div class="card">
      <div class="card-lantern">🏮 🎉 🏮</div>
      <h2>You found them all!</h2>
      <p class="tagline">All three twins unmasked — the lanterns burn a little brighter tonight.</p>
      ${rows}
      <p class="best">Final score: <b>${totalScore.toLocaleString('en-US')}</b></p>
      <button class="btn big" id="again-btn">↻ Play again</button>
      <button class="btn" id="menu3-btn">☰ Back to menu</button>
    </div>`;
  refs.overlay.classList.add('show');
}

export function hideOverlay() {
  refs.overlay.classList.remove('show');
  refs.overlay.innerHTML = '';
}

export function refsOf() { return refs; }
