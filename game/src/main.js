// main.js — the game itself: state machine, timer, scoring, hints, and the
// wiring between render, input and sound. Phases: title → playing →
// scene-win / time-up → results. The timer ticks on requestAnimationFrame
// so a hidden tab never eats the clock unfairly.
import { SCENE_ORDER, SCORE, HINTS_PER_SCENE, COMBO_WINDOW_MS, starsFor } from './config.js';
import { SCENES } from './scenes.js';
import * as render from './render.js';
import { bindPanels, bindKeys, nearestDiff } from './input.js';
import * as sound from './sound.js';
import { applyShotMode } from './shots.js';

const BEST_KEY = 'twin-lanterns-best-score';

const state = {
  phase: 'title',           // title | playing | paused | scene-win | time-up | results
  sceneIndex: 0,
  scene: SCENES[SCENE_ORDER[0]],
  found: new Set(),
  score: 0,
  combo: 0,
  lastFindAt: 0,
  hintsLeft: HINTS_PER_SCENE,
  timeLeftMs: 0,
  results: [],
  bestScore: Number(localStorage.getItem(BEST_KEY) || 0),
};

let lastTick = 0;
let rafId = 0;

function currentScene() {
  const scene = SCENES[SCENE_ORDER[state.sceneIndex]];
  scene.index = state.sceneIndex;
  return scene;
}

function startScene(index, keepScore = false) {
  state.sceneIndex = index;
  state.scene = currentScene();
  state.found = new Set();
  state.combo = 0;
  state.hintsLeft = HINTS_PER_SCENE;
  state.timeLeftMs = state.scene.timeLimit * 1000;
  if (!keepScore) state.score = 0;
  state.phase = 'playing';
  render.hideOverlay();
  render.drawScene(state.scene);
  render.updateHud(state);
  lastTick = performance.now();
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(tick);
}

function tick(now) {
  if (state.phase !== 'playing') return;
  const elapsed = now - lastTick;
  lastTick = now;
  state.timeLeftMs -= elapsed;
  if (state.timeLeftMs <= 0) {
    state.timeLeftMs = 0;
    render.updateHud(state);
    return timeUp();
  }
  // A tick in the last ten seconds so the pressure can be felt.
  const seconds = Math.ceil(state.timeLeftMs / 1000);
  if (seconds <= 10 && seconds !== tick._lastSecond) {
    tick._lastSecond = seconds;
    sound.playTick();
  }
  render.updateHud(state);
  rafId = requestAnimationFrame(tick);
}

function onPanelClick(svg, x, y) {
  if (state.phase !== 'playing') return;
  sound.unlock();
  const diff = nearestDiff(state.scene.differences, state.found, x, y);
  if (!diff) {
    state.score = Math.max(0, state.score - SCORE.wrongCost);
    state.combo = 0;
    state.timeLeftMs = Math.max(0, state.timeLeftMs - SCORE.wrongTime * 1000);
    sound.playWrong();
    render.markMiss(svg, x, y);
    render.showToast(`Not a difference — −${SCORE.wrongCost} pts, −${SCORE.wrongTime}s`);
    render.updateHud(state);
    return;
  }
  const now = performance.now();
  state.combo = (now - state.lastFindAt <= COMBO_WINDOW_MS) ? state.combo + 1 : 1;
  state.lastFindAt = now;
  state.found.add(diff.id);
  const gained = SCORE.find + (state.combo - 1) * SCORE.comboStep;
  state.score += gained;
  sound.playFind(state.combo);
  render.markFound(diff, state.found.size);
  render.showToast(`Found it! ${diff.label}  +${gained}`);
  render.updateHud(state);
  if (state.found.size === state.scene.differences.length) sceneWin();
}

function sceneWin() {
  cancelAnimationFrame(rafId);
  const secondsLeft = Math.floor(state.timeLeftMs / 1000);
  const stars = starsFor(secondsLeft);
  const bonus = secondsLeft * SCORE.winBonusPerSecond;
  state.score += bonus;
  const result = {
    scene: state.scene,
    stars,
    found: state.found.size,
    total: state.scene.differences.length,
    secondsLeft,
  };
  state.results[state.sceneIndex] = result;
  state.bestScore = Math.max(state.bestScore, state.score);
  localStorage.setItem(BEST_KEY, String(state.bestScore));
  sound.playWin();
  state.phase = 'scene-win';
  render.updateHud(state);
  const last = state.sceneIndex === SCENE_ORDER.length - 1;
  render.showSceneWin(state.scene, stars, secondsLeft, bonus, state.score);
  document.getElementById('next-btn').textContent = last ? 'See results →' : 'Next scene →';
  document.getElementById('next-btn').addEventListener('click', () => {
    sound.playClick();
    if (last) showResults(); else startScene(state.sceneIndex + 1, true);
  });
  document.getElementById('replay-btn').addEventListener('click', () => {
    sound.playClick();
    startScene(state.sceneIndex, true);
  });
}

function showResults() {
  state.phase = 'results';
  render.showResults(state.results, state.score);
  document.getElementById('again-btn').addEventListener('click', () => {
    sound.playClick();
    state.results = [];
    state.score = 0;
    startScene(0);
  });
  document.getElementById('menu3-btn').addEventListener('click', () => {
    sound.playClick();
    showTitle();
  });
}

function timeUp() {
  cancelAnimationFrame(rafId);
  state.phase = 'time-up';
  sound.playLose();
  render.showTimeUp(state.scene, state.found.size, state.scene.differences.length);
  document.getElementById('retry-btn').addEventListener('click', () => {
    sound.playClick();
    startScene(state.sceneIndex, true);
  });
  document.getElementById('menu2-btn').addEventListener('click', () => {
    sound.playClick();
    showTitle();
  });
}

function showTitle() {
  cancelAnimationFrame(rafId);
  state.phase = 'title';
  state.sceneIndex = 0;
  state.scene = currentScene();
  state.found = new Set();
  state.score = 0;
  state.combo = 0;
  state.hintsLeft = HINTS_PER_SCENE;
  state.timeLeftMs = state.scene.timeLimit * 1000;
  render.drawScene(state.scene);
  render.updateHud(state);
  render.showTitle(state.bestScore);
  document.getElementById('play-btn').addEventListener('click', () => {
    sound.unlock();
    sound.playClick();
    state.results = [];
    startScene(0);
  });
  document.querySelectorAll('.scene-pick').forEach((button) => {
    button.addEventListener('click', () => {
      sound.unlock();
      sound.playClick();
      state.results = [];
      startScene(SCENE_ORDER.indexOf(button.dataset.scene));
    });
  });
}

function useHint() {
  if (state.phase !== 'playing' || state.hintsLeft <= 0) return;
  const remaining = state.scene.differences.filter((d) => !state.found.has(d.id));
  if (!remaining.length) return;
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score - SCORE.hintCost);
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  sound.playHint();
  render.pulseHint(pick);
  render.showToast(`Hint: look near the ${pick.label.toLowerCase()}  −${SCORE.hintCost} pts`);
  render.updateHud(state);
}

function onKey(key) {
  if (key === 'm') {
    const muted = sound.toggleMute();
    render.refsOf().muteBtn.textContent = muted ? '🔇' : '🔊';
    return;
  }
  if (key === 'escape') {
    if (state.phase === 'playing') {
      state.phase = 'paused';
      cancelAnimationFrame(rafId);
      render.showPaused(state.scene, state.found.size, state.scene.differences.length);
      document.getElementById('resume-btn').addEventListener('click', () => {
        sound.playClick();
        state.phase = 'playing';
        render.hideOverlay();
        lastTick = performance.now();
        rafId = requestAnimationFrame(tick);
      });
      document.getElementById('restart-btn').addEventListener('click', () => {
        sound.playClick();
        startScene(state.sceneIndex, true);
      });
      document.getElementById('menu4-btn').addEventListener('click', () => {
        sound.playClick();
        showTitle();
      });
    }
    return;
  }
  if (key === 'h') { sound.unlock(); useHint(); return; }
  if (key === 'r' && (state.phase === 'playing' || state.phase === 'paused')) {
    sound.playClick();
    startScene(state.sceneIndex, true);
    return;
  }
  if (key === 'n' && state.phase === 'scene-win') {
    document.getElementById('next-btn').click();
    return;
  }
  if (['1', '2', '3'].includes(key) && state.phase === 'title') {
    document.querySelectorAll('.scene-pick')[Number(key) - 1]?.click();
  }
}

function boot() {
  const refs = render.buildShell();
  refs.hintBtn.addEventListener('click', () => { sound.unlock(); useHint(); });
  refs.muteBtn.addEventListener('click', () => {
    const muted = sound.toggleMute();
    refs.muteBtn.textContent = muted ? '🔇' : '🔊';
  });
  refs.menuBtn.addEventListener('click', () => { sound.playClick(); showTitle(); });
  bindPanels(refs, onPanelClick);
  bindKeys(onKey);
  document.addEventListener('pointerdown', () => sound.unlock(), { once: true });
  showTitle();
  // Deterministic screenshot states (?shot=start|play|scene2|win) — see shots.js.
  applyShotMode(state, { startScene, showTitle, showResults, sceneWin });
  window.__shotReady = true;
}

boot();
