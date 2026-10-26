# ORBITUNE — Game Design Document

## High concept
You are a singing comet climbing a sky of bell-stars. Orbit a star, release to slingshot off on the tangent, and get captured by the next star's gravity. **Every catch plays a note** in a pentatonic scale, so a good run literally composes its own melody; combos layer the soundtrack (arpeggio → hats → kick) until OVERDRIVE.

**Unique hook:** orbital slingshot timing × musical chord scoring × fuel economy. Your skill is audible.

## Core loop (2–5 s)
Orbit → read the sky → release (tap) or hold (slow-time aim) → fly → catch (note + points + fuel) → repeat.

## Secondary loops
- **Run (30–180 s):** climb sectors (18 catches each) while fuel burns faster over time; end by fuel-out or losing shields to shards/drift-outs.
- **Meta:** dust → Hangar upgrades (Focus, Gravity Well, Cold Burn, Halo Shield) and 6 comet trails; 3 rotating Constellation Orders (missions); player Rank (XP); daily streak dust; Daily Constellation seeded run; sector checkpoints (start at any sector reached).

## Mechanics
- **Orbit:** fixed linear speed (300 + 18/sector px/s); radius set by where you were caught.
- **Launch:** tangent velocity 560 + 20/sector px/s. One wall bounce allowed (BANK SHOT +60); a second wall exit = lost.
- **Catch:** within star radius + catch radius (38 + upgrades + adaptive assist). Catch within r+24 = PERFECT (+25, more fuel, focus refill, hit-stop, sparks).
- **Gravity assist:** near stars gently bend your path.
- **Chords:** 3 consecutive same-colour stars = CHORD (+150 × mult, chord stab, shockwave).
- **Combo:** +1 per catch, multiplier ×(1+combo/6) capped ×5; fades if you hesitate >2.6 s in orbit (hesitation bar). Combo 12 = OVERDRIVE (×2, wider gravity, gold trail, full music).
- **Fuel:** drains in orbit (6 → 12+/s over time and sector), less in flight; catches refill.
- **Focus (hold):** time ×0.3, dotted trajectory preview incl. bank bounce, target highlight; meter refills slowly and on perfects. Swipe or second finger while holding = reverse orbit direction.
- **Stars by sector:** 1 Nursery (static) · 2 Drift Reef (moving) · 3 Shard Veil (orange shard hazards) · 4 Brittle Choir (fragile stars crumble after 1.5 s) · 5 Event Horizon (EVENT: black holes bend flight + pulsars) · 6+ Far Song (all, faster).
- **Prism stars (4.5%):** variable-ratio loot: dust, FULL BURN, +1 shield, STARFALL points, rare JACKPOT.
- **Star motes:** gold triplets between rows — route choice for points/fuel; consecutive motes rise in pitch.

## Controls
Tap/release = launch · Hold = slow-time aim · Swipe while holding / two-finger = reverse orbit · Pause button top-right (auto-pause on tab hide).

## Difficulty curve & adaptivity
Speeds, hazards, node shrink and fuel drain scale with sector and run time. Adaptive assist (0–1, saved) widens catch radius and cuts drain after short runs (<35 s) and tightens after long runs (>80 s).

## Session design
Instant restart (AGAIN), results screen shows count-up score, new-best fanfare, mission ticks, rank-ups and "X dust to next unlock" teaser. Best-height dashed line in the world ("PAST YOUR BEST").

## Art & audio
See /STYLE_GUIDE.md (Celestial Ink Neon). Audio: all procedural Web Audio — A-minor pentatonic catch notes, chord stabs, convolution reverb, 4-chord ambient pad, intensity-driven arpeggio/hats/kick, key changes per sector.

## Content scope
6 sector types + infinite scaling, 4 upgrade lines (14 levels), 6 trails, 8 mission templates with tiers, 10 ranks, daily seed, streaks.

## Tech
Phaser 3.80 (vendored), ES modules, no external requests. 390-wide logical resolution, height adapts to aspect, Scale.FIT. Textures generated on canvas at boot; additive glow sprites instead of shader bloom for mobile perf. localStorage save `orbitune_v1`.

## v2 additions
Interactive tutorial (practice mode), early-sector forgiveness, shard telegraph/arming, Event Horizon black-hole sector, run share (Web Share/clipboard with melody glyphs), per-sector arpeggio patterns, results constellation. See CHANGELOG v2.

### Ghost of personal best (v4)
Normal runs: gold pace-marker ghost on the right edge following the best run's height over time. Daily: cyan ghost replays the day's best path (seeded world). Opacity is about 0.3. Not shown during the tutorial or before a best exists. Disabled if `save.ghost === false` (there is no settings screen yet).
