# Thinkamajig Design System (Master)

> When building a screen, check `pages/<screen>.md` first; it overrides this file. Otherwise follow this file.
> Tokens: `tokens.css`. Started from the ui-ux-pro-max generator (font pairing "Playful Creative":
> Fredoka + Nunito; dials variance 7, motion 6); its suggested palettes (crossword green, neon purple)
> and 3D/WebGL effects were rejected as off-brand and too heavy for phones around a table.

## Product
A lighthearted party word game. 3 to 10+ friends around a real table, each on their own phone.
Everyone writes a clue for a secret word, then guesses everyone else's, then the reveal gets laughs.
Phones are glanced at between conversation: every screen needs one obvious next action.

## Concept: game night on the table
A saturated grape "table" with white index cards dealt onto it. Your secret word lives on the
**Pocket Thinker**: an original retro handheld (tangerine body, amber screen, one big grape button,
strap loop) that you press to draw and hold to peek. It is the one bold, memorable element and
appears in every game. Every word display (mini screens, word chips, the reveal) uses its amber
screen. The yellow **sticky note** is now only the title card (home, welcome, game over).
Points are red **poker chips**.
No device, gadget or console metaphors. No imagery or wording from any published game.

Revision note: the first draft used a cream table. Checked against the brief, cream + warm accent
is a generic default and reads dim for a loud evening game, so the table became grape.

## Color (see tokens.css)
| Role | Hex | Use |
|---|---|---|
| Table | `#3D2470` | page background (white text 12.5:1) |
| Table deep | `#2E1A57` | bottom action bar |
| Lilac | `#D9CCF2` | secondary text on the table (8.2:1) |
| Card | `#FFFFFF` | all content surfaces; ink `#2A1A3A`, muted `#6B5A74` (6.3:1) |
| Sticky | `#FFE066` | title card on home / welcome / game over (ink 12.3:1) |
| Tangerine | `#FF8A3D` / lip `#D9661C` | Pocket Thinker body |
| Amber screen | `#FFB347` on `#2B1A0B` | every word display, VT323 font |
| Sun | `#FFC83D` | the one main action per screen (ink text 10.4:1; 8:1 against the table) |
| Cherry | `#D42E49` | poker chips / score |
| Success / Danger / Wager | `#0B7A6E` / `#C42B2B` / `#8A5A00` on tinted bgs | right / wrong / wager |
Never convey right/wrong with color alone: always icon + word.

## Typography
- Headings & numbers: **Fredoka** 600–700, letter-spacing -0.01em.
- Screen text: **VT323**, only on the Pocket Thinker amber screen.
- Body: **Nunito** 500–800. Base 16px / 1.45. Minimum 13px for any text, 15px for anything read during play.
- The clue being answered is the hero: 24–28px Fredoka.
- Scores and game codes use `font-variant-numeric: tabular-nums`.
- Game code: Fredoka 700, letter-spacing .18em.

## Shape, depth, spacing
- Radius: 10 / 14 / 20 / pill. Cards 20.
- Cards: white, 1px warm border, soft shadow. Index-card feel, slight (-1° to 1°) tilt only on decorative hero cards.
- Buttons: chunky with a 4px colored bottom lip that collapses on press (tactile, playful). This is the only
  hard (unblurred) shadow in the system; cards, fields and toasts use soft offset+blur shadows.
- Spacing scale 4 / 8 / 12 / 16 / 24 / 32. Screen gutter 16px.

## Layout
- Phone-first single column, content max 480px.
- ≥ 900px wide: the game sits in a centered 480px "card stack" on the table background; no stretched UI.
- Primary action pinned at the bottom bar, thumb-reachable, ≥ 56px tall. All targets ≥ 44px.

## Motion
- 120–250ms for state changes with `--ease-out` (no overshoot) for sheets, toggles and the note lift.
- `--ease-pop` (slight overshoot) only for celebrations: answers dropping in, the word slapping down, the lock-in check.
- Reveal: each answer card drops in with a small pop; the word sticky note flips up.
- Respect `prefers-reduced-motion`: no transforms, fades only.

## Voice
Short, warm, a little cheeky. "Lock it in", "Nobody got it", not system-speak.

## Anti-patterns
- Near-black "dashboard" chrome, neon gradients, glassmorphism, emoji as icons.
- More than one primary (sun) button on a screen.
- Text under 13px, gray-on-gray, color-only meaning, hidden focus rings.
- Imitating any commercial game's device, card art or branding.

## Screen plan
```
 phone (390)                       desktop (1440)
+----------------------+          grape table, 480px column centered
| [ABCD] Round 2  (o)5 =|  top     same layout; never stretched
| Write Answer Judge Rev|  steps   (a party game is played on phones; desktop
|                      |          is for the host's screen / testing)
|    .-------------.   |
|    |  STICKY NOTE |  |  hero: secret word / clue / reveal
|    '-------------'   |
|  [ white index card ] |  content cards, left aligned text
|----------------------|
| [   MAIN ACTION    ] |  sun button, 56px, thumb zone
+----------------------+
```
- Home: the title is written on the sticky note, tilted -2deg; name + code fields below.
- Write: face-down card "Tap to draw your word" -> sticky note you hold to peek -> clue card.
- Answer: clue is the hero (Fredoka 26px) on a white card; answer field and wager below.
- Judge: your sticky (mini) + answers with Right / Wrong segmented control (icon + word).
- Reveal: answers drop onto the card one by one; the word appears as a sticky strip.
- Results / end: standings list with tabular numbers; chips as red poker chips.
- Labels are sentence case, never tracked all-caps. No monospace anywhere.

## Decisions from review (critique 25/40 -> fixes)
- Right/wrong always shows icon + word (`.mark`), never color alone; a 0 score is neutral, not red.
- Judge: selected "Wrong" is a quiet tint; selected "Right" is solid teal, so matches stand out.
- Alerts are white cards with a mini sticky note (not yellow, so they never look like the main button); tap to dismiss; `role="alert"`.
- "Host", never "Leader". Sentence case everywhere (deliberately not Title Case).
- Peek works by keyboard too: hold Space or Enter on the note.

## James tribute (host option)
A host switch in the waiting room, off by default. When on, every phone shows a welcome card when
the game starts: "Welcome to the wonderful world of Thinkamajig" with "For James".
 Shown once per game per phone. Stored server-side as `tribute`, like `hard`.
