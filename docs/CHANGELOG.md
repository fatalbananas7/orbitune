# Changelog

## v6 — Spice + clarity (Zac playtest)
- Near-miss: CLOSE chime + cyan ring when a flight passes within 6 px of a star rim; GRAZE (+3 fuel) within 16 px of a shard. 0.45 s cooldown, off during hit-stop, Overdrive intro and tutorial.
- Combo milestones at 5/8/12/18/25/35 (HARMONIC, RESONANCE, Overdrive, SUPERNOVA, CELESTIAL, ASCENDANT) with HUD-space star flourish + arpeggio; one at a time.
- Results "what if" callout: biggest combo break, cause, sector, tip; marked on the constellation.
- Charged star (risk/reward): from sector 2, ~8% of stars. Tight catch = ×3 points +20 fuel; must launch within 1.3 s or it collapses (combo break + fling, no shield cost).
- Bankshot clarity: wall strips glow when the bounce is available, dim + tick mark once used, HUD BANK pip, preview shows exactly one bounce, BANKSHOT +60 +fuel callout.
- Visible shields: gold pips orbit the comet and sit in the HUD; shatter + sound + text on break; blinking red ring at 0 shields.
- One-time hints (bank, shield, charged); menu "?" HOW IT WORKS panel.
- Sector clear celebration: banner, 1–3 stars from perfects, bonus score, dust, +30 fuel, +1 shield on 3 stars, 18-tick progress strip.
- Modes: ENDLESS CLIMB (no stops, ghost, best height) and SECTOR RUN (clear → CONTINUE ▸ / BANK & EXIT, dust pot, streak multiplier ×1.25 per sector, start picker, best sectors + stars). Switch remembered. Daily uses Endless rules.
- Save migration: mode/bestSR/seen default in for old saves.

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

## v3 — Sharp rendering on high-DPI phones
- Root cause: the canvas was a fixed 390-px-wide backing buffer CSS-stretched ~2.7x on phones; text rendered at resolution 1 and thin ring textures were 128 px, so everything was upscaled and soft/pixelated.
- Canvas now renders at native resolution (LW*R x LH*R, R = min(DPR,3), capped at ~2.7M backing pixels); all cameras zoom by R with origin 0, so layout stays in the same 390-wide logical units at every DPR. Pointer coords divided by R; camera punch is R-relative.
- Text resolution = max(2, 1.25R). Procedural textures supersampled (2-3x): canvas drawn at TS x, frame resized to logical size with full-source UVs; star layers supersampled with tileScale 1/TS.
- Glow, vignette and nebula gradients: smoother 24-stop falloff + alpha dithering to remove banding. antialias on, pixelArt/roundPixels off, LINEAR filtering. No CSS image-rendering.
- Adaptive quality: if the first ~240 frames of a run average >26 ms, render scale is reduced 25% (min 0.5) from the next launch (localStorage `orbitune_q`).
- Cache-bust ?v=3.

## v4 — Clean menu + Ghost of personal best
- Menu: the "huge diamonds / giant foreground comet" frames were a v3 texture-sizing bug (supersampled frames set up with `setTrim`; Phaser's WebGL batcher draws quads at `cutWidth`, so every image texture rendered 3x). Replaced by `setSize` + full-source UVs. Verified with a 40-frame time-lapse at 390x844 DPR 3: icons stay 12–19 px the whole time.
- Ghost of personal best (`src/ghost.js`, localStorage `orbitune_ghost`, separate from the main save):
  - Normal runs use `Math.random` worlds, so a replayed path would be meaningless. The ghost is a **pace marker**: a faint gold comet on the right edge climbing at your best run's height-vs-time curve, with a short trail and a "BEST" tag when it's level with you. Only shown for runs starting at sector 1 (the same runs that set the YOUR BEST line).
  - Daily runs are seeded, so the star layout matches. The ghost **replays your path** for that day in dim cyan. It's stored per day, and older days are discarded.
  - Samples are quantised ints every 100 ms, capped at 5 minutes. A ghost is only overwritten when the run's height beats the stored ghost. Corrupt, old or malformed data is ignored.
  - Hidden during the tutorial and when no best exists. Visual only (no collisions). Fixed cost: 4 display objects.
- Cache-bust ?v=4.
