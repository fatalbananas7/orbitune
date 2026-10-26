# ORBITUNE
A neon orbital-slingshot game where every catch is a note. Phaser 3, fully offline, no build step.

**Play on your phone:** open the GitHub Pages URL in Chrome (Android). Tap "Add to Home screen" for fullscreen. Turn sound on!
**Controls:** release to launch · hold to slow time & aim · swipe while holding (or second finger) to reverse orbit.
**Run locally:** `python3 -m http.server` in this folder and open http://localhost:8000 (on your phone use your PC's LAN IP).
**Tests:** `npm i && npx playwright install chromium`, then `node tests/bot.mjs 60 tag` (bot player, SKILL=0..1 env) and `node tests/ui.mjs`.
Docs: docs/CONCEPTS.md, docs/GDD.md, docs/DESIGN_SUMMARY.md, STYLE_GUIDE.md, docs/CHANGELOG.md, docs/IDEAS_NOT_IMPLEMENTED.md
