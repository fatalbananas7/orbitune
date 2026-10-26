# Changelog

## Base build (v0.1)
Concept, style guide, procedural textures, Menu/Hangar/Game scenes, orbit/launch/catch physics, sectors, hazards, fragile/moving/pulsar stars, prism loot, overdrive, fuel, focus aim preview, missions, upgrades, trails, daily seed, adaptive assist, procedural audio, PWA manifest/icons.

## Test cycle 1 — visuals/UI (Playwright 390×844 touch, screenshots)
- Glowing text rendered dark rectangles (shadow clipped) → added padding equal to blur.
- Missions panel collided with bottom tip → clamped layout to screen height.
- Catch rings too noisy → alpha 0.16 → 0.10.
- Tutorial hints could get stuck if player never held → also advance by catch count.

## Test cycle 2 — balance (scripted bots at skill 0.6/0.9)
- Bots never died in 60 s: fuel was net-positive and walls bounced infinitely, gravity assist too strong.
  → catch refill 10→6 (perfect 18→13), drain rises with run time and sector, gravity 260→170, only ONE bank bounce, flying out sideways = lost.
- Score inflation (×10+ at combo 30) → multiplier capped ×5 (×10 in overdrive only).

## Test cycle 3 — session length / frustration
- After fix, misfire runs ended in 7–8 s with a single life → base shields 1→2 (+ Halo upgrades).
- Added run logging (score/time/sector/cause) to the bot.

## Test cycle 4 — UI flows & input
- Automated tap tests: Hangar buy/equip, Back, Daily, hold-to-focus (CDP touch), pause button — all pass, 0 console errors.
- Event Horizon trail's dark core was invisible → light core + magenta halo.
- Hesitation bar showed at combo 1 → only from combo 2.

## Expansion phase (prioritised list → implemented top 5)
1. **Best-height line + "PAST YOUR BEST" banner** — the strongest "one more" hook; a visible goal in the world.
2. **Star motes** — gold triplets between rows; adds route choice in flight and a rising-pitch mini-reward, strengthening the core loop rather than adding a system.
3. **Constellation trace** — your caught stars are linked by fading lines behind you; visual reward for flow.
4. **Player Rank (10 ranks, XP from catches/perfects/chords)** — long-term progression with dust payouts and rank-up fanfare on results.
5. **Daily streak** — consecutive-day dust bonus (25 × day, cap 7) with menu popup.
(Prism loot, Overdrive and music-intensity layers were promoted into the base during build.)

## Expansion test cycle 5
- Dust per run too generous (500+) vs costs → score/25 → score/40.
- Perfect window too tight in practice (1 perfect / 62 catches for bot) → r+21 → r+24.
- Menu dust counter didn't include the streak bonus → live update.

## Expansion test cycle 6 — soak
- 3-minute soak at bot skill 0.97: 4 runs of 26–55 s (sessions in target range), object count stable (~60–80), 0 errors. Headless SwiftShader averages ~28 fps (software GL); real phones run GPU WebGL.
