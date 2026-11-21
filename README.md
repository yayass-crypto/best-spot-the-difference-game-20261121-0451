# Twin Lanterns — Spot the Difference

An original spot-the-difference game built for the make.fun competition
[best-spot-the-difference-game-20261121-0451](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).

Two pictures hang side by side. They look the same — but the twin is hiding
**25 differences across three hand-drawn scenes**. Find them all before the
clock runs out.

## Play

Open `game/index.html` in a desktop browser (or run `node serve.ts` and open
http://localhost:8080). No build step, no network requests, no libraries.

- **Click** a difference on either picture — a gold ring marks it on both.
- **Counter** in the HUD reads how many you found and how many remain.
- **Hints** (H or the 💡 button): 3 per scene, each pulses an unfound
  difference and costs 25 points.
- **Wrong clicks** cost 10 points and 3 seconds; quick finds build a combo.
- **Keyboard:** H hint · M sound · R restart scene · N next scene ·
  1–3 choose a scene · Esc pause/menu.
- **Scenes:** Koi Pond at Dusk (8 differences, 2:30) → The Starlight Bakery
  (8 differences, 2:00) → The Clockmaker's Workshop (9 differences, 1:40).
  Clearing a scene earns stars by time left plus a time bonus.

## Scenes

Every picture is drawn by hand in code (SVG shapes in `game/src/scenes.js`) —
no copied art, no commercial characters, no stock images. Sounds are
synthesized with WebAudio (`game/src/sound.js`), so the game ships no audio
files at all.

## Files

| File | Job |
| --- | --- |
| `game/index.html` | Page shell |
| `game/src/main.js` | State machine, timer, scoring, wiring |
| `game/src/config.js` | Scenes, timers, scoring numbers |
| `game/src/scenes.js` | The three scenes and their 25 differences |
| `game/src/svg.js` | SVG helpers and shared shapes |
| `game/src/render.js` | Panels, markers, HUD, screens |
| `game/src/input.js` | Pointer + keyboard play, hit-testing |
| `game/src/sound.js` | Synthesized WebAudio sounds |
| `game/src/shots.js` | Deterministic `?shot=` states for screenshots |
| `game/src/style.css` | The whole look |
| `main.ts` | Hands the game in: copies `game/` + `screenshots/` to `/output`, writes `dossier.json` |
| `screenshots/` | 4 real renders of the game's own code |

## License

MIT — see `LICENSE`.
