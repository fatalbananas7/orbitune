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

# v2 — polish & depth pass

## Phase 1 — Menu rebuild
- Layout is now anchored to the bottom and computed from the screen height, so nothing overlaps from 640 to 915 px tall (tested at 360×640, 360×740, 390×844 and 412×915). The hero art scales to fill whatever space is left.
- PLAY is the hero: a large cyan pill with a breathing glow and a pulsing label. Gold is now used only for dust and rewards (AGAIN on the results screen also moved from gold to cyan).
- Top bar: a dust pill, rank name with an XP bar, and mute. Chip row: BEST and DAY-N STREAK. The ‹ › sector-start selector replaced the old chips that collided with other elements. DAILY shows today's best.
- Idle motion: the comet now passes behind and in front of the hero star, the dashed orbit rotates slowly, three satellite stars float, and the halo and title breathe. The menu fades in.
- Missions panel: tidy rows with dividers, a prism reward icon, and a "done" counter. Missions no longer repeat a type.

## Phase 2 — Juice
- PERFECT: hit-stop 75 ms, a new large gold/white spark emitter, a 3.5% camera zoom punch, a gold shockwave and a big scaling PERFECT stamp.
- OVERDRIVE entry is now an event: 160 ms hit-stop, a 9% zoom punch, 3 staggered shockwaves, 60 sparks, a 46 px slam-in title, a dedicated riser/kick/chord sound and a pulsing gold screen-edge glow for as long as it lasts.
- The constellation is drawn in two passes (glow plus a crisp line); perfect catches are marked with gold dots and chords with magenta rings.
- Results screen: the panel fits its content; a five-stat row (catches, perfect, chords, max combo, sector); the run's constellation animates in as a horizontal "melody score"; buttons are MENU / SHARE / HANGAR.

## Phase 3 — Onboarding & early balance
- Interactive first-run tutorial with these steps: release → HOLD (advances after 0.45 s of focus) → SLIDE to reverse → catch a PERFECT. Each step falls back to advancing automatically after a few catches, so nobody gets stuck. While the tutorial is active you take no damage and fuel stays at 40% or more.
- Catch radius is +12 in sector 1 and +6 in sector 2. Fuel drain starts at 70% and ramps to 100% over the first 80 s.
- Shards move at 0.6× speed in the first sector where they appear. Each shard has a dashed orange track line and a pulsing halo, and is harmless for 0.9 s after it enters the screen while it fades in (arming).
- Pointer handling: `pointerupoutside` still launches; `pointercancel`/`touchcancel` cancel the press without launching.

## Phase 4 — Features
- **Event Horizon (sector 5, an event sector):** black holes with a rotating accretion disk pull on your flight path. Touching the core counts as being lost. Entering the sector triggers a rumble, a zoom and a banner. Black holes appear rarely in later sectors too.
- **Run share:** SHARE uses the Web Share API, or falls back to the clipboard. The text includes score, sector, catches, perfects, chords, the run's melody as block glyphs (✦ = perfect) and the URL.
- **Sector musical identity:** each sector has its own arpeggio pattern and key.
- Mobile: a "rotate to portrait" overlay on landscape phones, and `?v=2` cache-busting on every script and module import.

## v2 test cycles
- Menu screenshots taken at 4 aspect ratios (iterated twice: the subtitle collided with the selector and the streak popup collided with the title; both fixed).
- Scripted bot soaks (150 s, skill 0.7–0.95, with and without the tutorial): runs lasted 23–100+ s, the object count stayed stable at 75–100, and there were 0 console errors.
- Feature script: forced overdrive and perfect captured, plus the event sector. The tutorial's hold → reverse steps were verified using CDP touch input.
- Fixes: the tutorial could stall forever for players who never hold (added fallbacks); floating text was clipped at the screen edges (now clamped); black-hole pull 620 → 480.
