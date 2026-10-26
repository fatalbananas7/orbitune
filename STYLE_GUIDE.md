# ORBITUNE — Locked Style Guide: "Celestial Ink Neon"

A hybrid of **neon glow** and **refined minimalism**: luminous additive light on deep ink-indigo space. No outlines on world objects — form comes from light (rim-lit rings + additive halos). UI is thin 2px luminous strokes in pill shapes.

## Palette (exact)
| Role | Hex |
|---|---|
| Void (bg deepest) | `#0B0A1F` |
| Ink (bg mid / panels) | `#1A1640` |
| Dusk (nebula) | `#3B1E6E` |
| Node A — Tide cyan | `#3EF2E0` |
| Node B — Chorus magenta | `#FF4FD8` |
| Node C — Hymn violet | `#9B7BFF` |
| Gold / reward / comet | `#FFC94A` |
| Danger (shards only) | `#FF5A3C` |
| Text | `#F4F1FF` |
| Text dim | `#8E87C9` |

Rule: red-orange `#FF5A3C` is reserved for things that hurt you. Gold is reserved for rewards and the player. Cool hues (cyan/magenta/violet) are safe interactables.

## Lighting
- Every emissive object = solid core + additive radial halo (pre-rendered `glow` texture, tinted). Halo alpha 0.25–0.6. This is our "bloom".
- Background: 3 parallax star layers (0.1 / 0.25 / 0.5 scroll) + soft nebula blobs; screen-space vignette on top (edges to 60% black).
- Sector changes re-grade the nebula tint.

## Shapes & line
- World objects: circles and rings, no outlines; rim gradient white→transparent tinted by hue.
- Hazards: sharp 6-point stars — the only angular shape in the game, so danger reads instantly.
- UI: pill buttons, 2px stroke, 18% fill, glow behind. System sans, bold, letter-spaced titles.

## Animation principles
- Everything eases (Back.out for appear/press release, Sine for idle breathing, Cubic.out for fly-ins).
- Hit-stop 40–70 ms on perfect catches and damage. Screen shake small (0.004–0.012).
- Particles are *intentional*: catch = ring burst in node hue; perfect = gold sparks; damage = orange shards; loot = gold fountain. Nothing emits without cause.
- Comet trail: tapering additive ribbon, 26 samples.
