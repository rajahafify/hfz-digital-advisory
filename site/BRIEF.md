# BRIEF.md — HFZ Digital Advisory rate card

**Self-authored, not interviewed.** Direction came from the client across the
session ("usable but no wow factor", "make the quote builder one skippable
section", "is this generic?") rather than a formal eight-question interview.
Answers below are authored decisions, not verbatim client answers. Re-run the
interview if the client wants to change the aesthetic family.

## The eight topics (authored)

1. **Vibe:** printed rate card, credible, unhurried, priced. References: a
   Michelin guide page, an old Penguin colophon, a hardware store catalogue.
2. **Sequence:** title page → why sites fail → the rate card → websites → the
   rest → your quote → how it runs → questions → colophon.
3. **Energy:** quiet opener, dense middle (the rate card is the loud part, from
   data density not motion), peak in chapter five, quiet resolve.
4. **Feeling, stage by stage:** see the curve below.
5. **One thing no other site does:** you total your own job on the page and send
   the total to the agency.
6. **Range:** premium-minimal, leaning editorial. Not brutalist, not maximalist.
7. **Structure:** distinct scenes (chapters), not one continuous world.
8. **Assets:** none supplied, no generation budget. Type and rules only.

## Grammar: 2.2 Chaptered editorial

The page is a printed rate card. Chapters are the unit.

Why the other seven lost:

- **Filmic one-shot** needs continuous footage we do not have, and forbids an
  index, which is the whole point of a rate card.
- **Live surface** forbids marketing chrome and display section headings; the
  quote plate borrows its honesty rule, but the page must stay prose and prose
  must stay findable.
- **Continuous world** requires worldflight legs and real geography; a price list
  has no geography.
- **Typographic poster** forbids cards and data tables; there is a 12-row table.
- **Gallery / catalog** wants labels with no persuasion and a hero that is object
  one; this page has to argue, not just list.
- **Split stage** needs two opposed columns held for the whole page; the content
  is a list, not a binary.
- **Rhythmic cutlist** is for energy brands with 12 to 20 short acts at speed.
  Wrong temperature for an SME owner checking whether they can trust a supplier.

**Bans I am holding:** no `drift` gradient between chapters (each chapter is a
hard change of ground), no full-bleed scrub hero, no pinned crossfade type acts,
no magnetic CTA, no centred hero copy.

## Signature move: the quote plate (chapter five)

One section, skippable. Three questions (what do you need / which website /
anything else), and a receipt that totals as you answer. The total is live in the
colophon, and one tap sends the itemised list to WhatsApp. Bespoke JS, computed
from the same `pricing.js` the printed rate card renders from, so the receipt can
never disagree with the table.

## World: technical document, not artisan print

The first pass of this grammar was dressed as a printed rate card on warm paper
with a serif display face, a vermillion accent, and a rotated perforated
kraft-paper receipt. The client's verdict: **"it feels like I'm selling scented
candles instead of websites."** Correct. Serif, warm paper and craft texture are
the visual language of handmade goods. The company sells domain, hosting and
infrastructure.

Re-dressed on the same grammar (this is the world axis, not the structure axis):

- Cool ground `#F5F6F8`, ink `#0E131A`, single blue accent `#1B62D6`.
- Display and body both sans (Inter), weight 600, tracking -0.028em. Mono only
  where a number or a label is being read: prices, chapter numbers, table cells.
- Tabular numerals on every figure so columns align like a spec sheet.
- Square corners (3px), hairline rules, no cards with shadows.
- A dot-grid field behind the title page, masked off diagonally.
- The quote panel lost its rotation and perforation. It is now a flat estimate
  panel with a 2px rule over the total.

What stayed: chapters, the folio, hard ground cuts, the colophon, the ledger
with dotted leaders. Those are structure, and structure was not the problem.

## World v2: the reference language

The client supplied three screenshots and said, in effect, *this is the level*:

- **Sonder Studio** — the same build the skill's own `hero-depth.md` cites as its
  approved example. Layered photographic hero, woman in red against grey mountains,
  `Make yourself` in a grotesque with `unforgettable` in an italic serif beneath it,
  "INDEPENDENT MINDS. UNFORGETTABLE STORIES." as an eyebrow, `01 / THE FIRST
  IMPRESSION` bottom-left, `A SONDER PERSPECTIVE` bottom-right, hairline rules
  separating the corner labels, `SCROLL TO FEEL IT ↓` on the right.
- **Valcère** — a watch. Burgundy ground, gold serif display (`Time. Unbound.`),
  centred wordmark with a mono tagline under it, `Explore` left, `Private enquiry`
  right, bottom rail of `A WORLD APART.` / `NOCTURNE` with a circular button.
- **Glaido** — voice dictation. Near-black ground, giant sans display in white and
  yellow (`Think it. Say it. Done.`), mono eyebrow `YOUR VOICE. EVERYWHERE.`, pill
  CTA, floating 3D icons, mono corner labels at the bottom.

Four devices are common to all three, and those are what got taken:

1. **Corner label rails.** Small mono uppercase labels pinned to the bottom
   corners, separated by hairline rules, carrying a mix of section counter and
   brand statement.
2. **A display headline that changes voice mid-sentence.** Grotesque for the
   statement, italic serif for the emotional half. Sonder does it, Valcère does it.
3. **One accent, one marker.** A single accent colour, plus a small round marker
   that recurs across all three references.
4. **A dark ground with hairline rules.** Two of the three are near-black. The
   third is deep burgundy. None is a light grey page.

Applied to this build:

- Ground flipped from `#F5F6F8` to `#0B0C0E`, accent from blue to `#E9F94A`.
- New top bar: wordmark with a mono sub-label, four mono nav links, one pill CTA.
- Hero: mono eyebrow in the accent, then `Every price on the page.` in the
  grotesque and `Nothing on request.` in italic serif at the same 95px. Then a
  pill CTA and an underlined link carrying the marker dot.
- Bottom rail: the three floor prices as mono labels with hairline separation,
  ending on `Written scope, fixed price`.
- **One chapter prints on paper.** The websites chapter is now the only light
  surface in the document, so the dark reads as a decision rather than a default.
- The italic serif device was also added to five of the six sample sites, so the
  hero language and the work in the scene are the same language.

## Engine: wired, then removed

`scrollcraft.js` was mounted and then taken out. Reason, recorded so it is not
retried: `data-sc-reveal` is a `clip-path` wipe keyed to an act's `--sc-p`. On
short flow chapters the act's progress never reaches the wipe window before the
heading has scrolled past, so headings stayed clipped. The harness caught it and
I read the numbers wrong: `wipes: ["inset(0px 0px 99.39%)", ...]` was logged as
evidence of motion when it was evidence of a heading 99% clipped. Same class of
failure for `data-sc-in` in acts the reader outruns.

**The engine's cue system is built for pinned cinematic acts. This grammar has no
pinned acts, so the engine's visibility model does not apply.** Entrance motion
is now an IntersectionObserver added from JS. The grammar, the curve, the gate and
the verification harness still come from the skill; the mechanism does not.

## Fingerprint gate

Registry `~/.workbuddy-ai/skills/scroll-craft/scrollcraft/FINGERPRINTS.md` is
empty. First build, nothing to clear.

## Feeling curve

| Chapter | Feeling | Caused by |
|---|---|---|
| Title page | Calm, priced | Type on paper, three floor figures, no imagery |
| 01 Your quote | **Peak: control** | The receipt totals under the reader's own hand |
| 02 Why sites fail | Recognition | Four sentences the reader has already lived |
| 03 Rate card | Density, relief | Twelve rows, both price columns, no gating, and they prove the number just built |
| 04 Websites | Choice | Three tiers on a dark ground |
| 05 The rest | Completeness | Add-ons, maintenance, SEO, all at list price |
| 06 How it runs | Safety | Four steps, the 50/40/10 named out loud |
| 07 Questions | Settled | Objections answered before they are asked |
| Colophon | Resolve | The CTA is a line of running text carrying their total |

## Peak

"It added itself up as I clicked and I sent it straight to them." Lives in
chapter one, at the client’s request: the title page was doing nothing, so the
interactive plate now starts at 805px on a 900px viewport. The peak therefore
leads the page. Consequence, accepted: there is no build-up to it, and the rate
card that follows reads as evidence for the number rather than as the argument
that earns the click.

## Tell-someone sentence

"It's the site where you total up your own quote and WhatsApp it to them."

## Score

| Beat | Device | Why |
|---|---|---|
| Title page | observer reveal, staggered floor figures | Nothing to hold yet |
| 01 Your quote | observer reveal plus bespoke state machine | The surface answers the reader |
| 02-05 | observer reveal per block, hard ground cuts | Chapters land whole, no progress-driven wipes |
| 06-07 | observer reveal with stagger | Quiet, sequential |
| Colophon | static | The close holds |

Honest note on the device count: this build has **one** entrance device (the observer
reveal) plus the bespoke state machine in chapter 01. The four-family rule in the
skill is written for pages that score a scroll journey; an editorial rate card
whose chapters all land the same way cannot fake four families without becoming
the thing that rule exists to prevent. The variety here is structural: hard ground
cuts, an asymmetric spread, a full-bleed table, a two-column ledger, a working
plate, and a colophon.

## Hero scene: real sample pages in 3D

Client request: a real, fully designed website, scaled down and previewed in 3D.
Not a skeleton, not a wireframe card with three grey blocks.

Each panel is a **complete site authored at 1440x900 and scaled to 0.3**, not
drawn small. That matters: the type hierarchy, spacing, grid and colour are the
real ones, so what you see in the panel is the design, reduced. Rendered with
`CSS3DRenderer`, so the markup stays real and selectable. No screenshots, no
textures, no canvas painting.

Three sites, one design system each, each with five or six real sections:

- **Utama Renovation** (trades) — dark ground, terracotta accent, offset colour
  blocks, three-card services, project grid.
- **Ampersand Dental** (clinic) — light ground, blue accent, appointment card
  with live time slots, price list, testimonial.
- **Kopi & Co** (café) — warm ground, menu ledger with dotted rhythm, hours.

No invented statistics anywhere in them. The renovation site says "Fixed scope,
one crew, no variation" instead of "412 jobs, 18 years". Fake numbers would be
fake numbers even inside a sample.

## The samples are real sites now

The client asked whether the sample sites could be built separately and shown,
rather than living as scaled-down DOM inside the hero. Yes, and it was the right
call: the old approach meant the "sites" could not be opened, linked, indexed, or
handed to a client. They were pictures of websites made of divs.

Now each sample is a standalone page:

```
public/samples/
  utama.html  ampersand.html  kopi.html
  northbridge.html  lumen.html  halcyon.html
  sample.css   (shared, 1171 lines)
  sample.js    (shared, real site behaviour)
```

- Each is a full document with its own title, description, `noindex`, and body.
  Direct URL works: `/samples/utama.html`.
- `sample.js` gives every one genuine site behaviour: an IntersectionObserver
  reveals sections as they scroll in, and the page publishes its own scroll
  progress as `--mp` for its parallax layers. Nothing in there knows the hero
  exists.
- The hero frames them in same-origin `iframe`s inside the 3D panels, at 1440x900
  scaled to 0.3 — the same scale trick, but the content is now a real document.
- **The hero drives the framed page's own scroll** via `contentWindow.scrollTo`.
  So the parallax and reveals inside each sample run off real scroll position.
  This is the honest version of the earlier fake: no keyframe loops.
- Loading is lazy. A panel's `src` is set only when it is on stage or next, and
  the next one is warmed so it is painted before it arrives. A poster frame holds
  the panel until the document loads.
- The hero rail names the site on stage and links to it, so a visitor can open
  one properly. Verified tracking: Utama Renovation to Ampersand Dental as the
  stage advances.

Verified per site, loaded directly: all six return 200, real titles, real
headlines, body heights 1496 to 2295, `--mp` reaching 0.50 to 1.00 on scroll, and
3 to 8 elements revealed. In the hero: iframes load lazily (2 to 3 resident), the
live frame's `scrollY` is driven (1173 then 504 with matching `--mp`), 60fps, no
errors.

## The stage: one site at a time, in focus

Two notes from the client drove the current version.

**"The animation is annoying behind the text. Make them get unfocussed faster."**
So the marquee is gone. There is now exactly one panel in focus at any moment,
and it sits right of the copy: the stage is offset `+350` and the copy column is
capped at 560px, so during a hold the live panel clears the headline by 7px. The
other five panels are always blurred (`blur(7-8px)`, saturate 0.7, brightness 0.7)
and dimmed to 0.12-0.2. Blur ramps in fast on the way out and snaps to `none`
once it is under 0.15px, so the live panel carries no filter at all.

**"Holodecky: comes in small, gets bigger, stops for a bit, moves away getting
smaller while being replaced."** Then, on seeing it: **"the leaving animation is
too long — combine it with the entering one. One leaves by reversing, the other
swipes in."** That was correct, and it was a structural bug, not a timing tweak.

The first version ran a leave phase and *then* an enter phase, because the cycle
advanced by incrementing an index. So the outgoing panel shrank away for 1.74s
with nothing else moving, and only then did the next panel start from scratch.
Total ~3.1s of transition per cycle.

The fix is a continuous stage timeline instead of an index. Each panel's local
position is `x = ((s - i + ENTER) mod n) - ENTER`, so two panels occupy the same
window by construction:

| x | State |
|---|---|
| -0.19 → 0 | **swipes in** from the left, lateral, `rotateY 0.34`, opacity 0 → 1, blur 7 → 0 |
| 0 → 0.81 | holds at `z +180`, no filter, with its micro-animation running |
| 0.81 → 1 | **reverses out** to the right, `z -820`, scale 0.6, opacity → 0, blur → 9 |

Measured over 52 samples at 120ms: **longest gap with nothing visible: 0ms.**
Longest window with two panels simultaneously visible: **840ms**. Nothing is ever
static while something else is leaving. Cycle is 5.2s.

**"While stopped, animate the page to show off its animatedness."** The hold is a
demonstration. Each site runs its own micro-animation, added by the is-live class
and removed when it leaves, so nothing animates off-stage:/n/n| Site | What runs while it holds |
|---|---|
| Utama | Hero plate parallax, ticker marquee, CTA pulse, index rows rising in sequence |
| Ampersand | Plate wipe reveal, fee rows rising in a stagger, CTA pulse |
| Kopi | Roundel spinning, menu rows highlighting one after another, plate wipes |
| Northbridge | Index rows rising in sequence, each arrow sliding on a loop |
| Lumen | Three figures wiping in one after another with staggered delays |
| Halcyon | Cropped type rising, ticker marquee, offset numerals rising in sequence, plate wipes |

**"All the animations are too simple. I want real parallax inside them."** Also
correct. So each site now carries genuine scroll-linked parallax, driven by its
own scroll progress rather than a looping keyframe.

The scene publishes the miniature progress as a CSS variable (--mp, 0 to 1 across
the hold) and the site consumes it in calc(). Layers move at different rates
against the page:

- Full-bleed hero plates: -140px over the hold, the slowest layer.
- Plate rows: three different rates, including one that also drifts sideways
  (+34px x, -132px y), so a row of three reads as depth instead of a sheet.
- Copy columns (.u-type, .a-left, .k-hero, .n-lead, .l-lead, .h-crop): +86px,
  drifting the opposite way to the page so the text separates from it.
- The Lumen gallery column runs furthest at -170px.

Measured: 13 distinct plate transforms across 14 samples, with the hero plate
moving -90 to -118px as progress advances. This is parallax against real scroll
position, not an animation loop, which is why it holds up under inspection.

## Earlier: the ring, and why it went

The client's second verdict was that the ring put the sites too far away: half the
time you were looking at them across a distance. Correct, and the ring was the
cause. Rebuilt as **the hero is the scene**:

- **Full bleed.** The scene covers the whole hero (measured 1440x810, exactly the
  hero box). It is no longer a column beside the copy.
- **Layer order, verified in the DOM:** copy `z-index: 3`, scrim `2`, scene `1`.
  The words sit on top; the sites run behind them as background.
- **A close wall, not a ring.** Six sites on a shallow arc, spacing 470, camera at
  940. Visible panels measure **539x338 px** on a 1440x810 fold, with three
  substantial panels on screen at once. They fill the frame instead of receding
  into the middle distance.
- **Endless drift.** The wall wraps modulo its own span, so it never runs out of
  panels and never stops. Idle speed 0.62 px/frame, scroll adds 3.2.
- **Scrim only where the words are.** A 100-degree gradient, solid ground for the
  first 26%, fully transparent by 76%. The left side stays readable, the right
  side shows the sites. Not a full-frame overlay.
- Each miniature still scrolls its own page; pointer adds camera parallax.
- Reduced motion renders one static frame. Below 900px the scene is not rendered
  and three is never requested. three is ~187 kB gzipped, idle-loaded, desktop only.

**This is a bigger break from the grammar than the last one, and I am not hiding
it.** Chaptered editorial says the hero is a title page: type on paper, no media
above the fold. This hero is now entirely media with type on top. That is the
opposite. Kept because it was asked for twice, and because a price list for a web
agency arguably has to show websites. If strict compliance matters more, the
scene moves to chapter two and the title page returns to type only.

## The ceiling I hit, stated plainly

The client's verdict on the miniature sites: **slop, and not close to the work in
the reference video.** Agreed, and the reason is not craft I can iterate my way
out of.

The reference work is photographic. Layered photographic plates, real depth from
camera and occlusion, art-directed light. None of that is available to this build:

- no photography or footage was supplied,
- no image-generation key is set (`KIE_AI_API_KEY`),
- and CSS can draw blocks, gradients and type, but it cannot draw a photograph.

So the miniatures are flat colour fields with real typography on top. That is the
whole of what CSS-only can reach. Every further round of "make it less slop" that
stays inside CSS will move it a small amount and stop.

## What award winners actually do (and what was copied)

Two sources were read, and both changed the plan:

- **hontran.dev, "10 Best Award-Winning Websites of 2026"** by an Awwwards jury
  member. The useful part is not the list, it is the criteria. The gap between a
  6.5 and a 9 lives in three places at once: **art direction** (a point of view,
  not a decorated template), **directed motion** (choreography, not effects), and
  **performance** (60fps on a mid-range phone; jurors test on real devices). The
  juror's own first test is the one that mattered most here: *"Kill the motion in
  your head. Screenshot the hero. Is the static frame still strong?"*
- **webdesignawards.io agency archive.** Its published rubric names the failure
  exactly: *"Concept: a clear point of view. Work that could only come from this
  team, **not a template with the logo swapped.**"*

That was the diagnosis. All six miniatures shared one skeleton, and only the
tokens changed. Six colours of the same page is the definition of a template with
the logo swapped, and no amount of gradient work was going to fix it.

### What was built instead: six structures

Each site now has its own layout grammar and its own typographic idea, verified
by reading the DOM:

| Site | Structure | Idea |
|---|---|---|
| Utama (trades) | hero → ticker → index → work → quote → foot | Editorial poster. Full-bleed plate, 100px type sitting on it behind a bottom-up scrim |
| Ampersand (clinic) | bar → split → fees → quote → foot | Split screen, calm. No cards anywhere, fees as a plain ledger |
| Kopi (café) | bar → hero → menu → plates → foot | Centred editorial with a roundel in the nav and a two-column menu |
| Northbridge (legal) | bar → lead → index → note → foot | A typographic index. Five full-width rows. **No imagery at all** |
| Lumen (interior) | bar → lead → gallery → foot | Gallery first. One 780px plate against two, captions in the mono margin |
| Halcyon (fitness) | bar → hero → ticker → nums → plates → foot | Kinetic. 216px cropped type, lime on black, offset numerals |

Page heights are now 1516 to 2350 and deliberately unequal. Section counts run 4
to 6. No two sites share a section order.

Kept from the craft pass, because it still helps: **composed gradient plates**
(highlight + vignette + two-stop body), **grain** at overlay blending, and the
named plate variants. Those are texture. Structure was the actual problem.

Three ways past the remaining gap, in order of how good the result will be:

1. **Supply real assets.** Photos of actual client work, or footage. The skill
   says this explicitly: real assets anchor the world and beat generated ones.
   Cheapest and best.
2. **Set `KIE_AI_API_KEY`.** Then the skill's own pipeline generates the plates
   (`scripts/kie.mjs still`), one style preamble reused verbatim so six images
   look like one shoot. Stills cost cents.
3. **Accept the CSS ceiling** and spend the effort on typography and layout craft
   instead, with the understanding that it will not look like the reference.

## Reference sources used

Dribbble was asked for and **could not be read**: dribbble.com/search/landing-page
returns a bot checkpoint (Human Verification), not shots. No Dribbble work was
copied. The reference patterns applied instead came from the sources in the
inspiration brief: godly.design, land-book, saaspo, 21st.dev, plus the scroll-craft
skill own approved-collection notes.

The two patterns borrowed from those galleries for this hero: full-bleed scene with
the headline as the top layer, and a dimmed/silhouetted gallery behind a directional
scrim rather than a centred hero claim over a photo.

## Verified / not verified

Exchange: over 52 samples at 120ms, the longest stretch with **nothing visible
was 0ms**, and the longest stretch with **two panels simultaneously visible was
840ms**. Nothing is ever static while something else leaves.

Parallax: 13 distinct plate transforms across 14 samples, hero plate moving -90 to
-118px as miniature progress advances, and the miniature itself scrolled -840 to
-1242px across the same window. So the two rates are genuinely independent.

Stage: exactly one panel holds the is-live class at a time (0 during the
exchange, which is correct — the two in transition are both moving). During a
hold the live panel clears the copy column by 7px. Micro-animations confirmed
running on the live panel (scPar, scPulse, scMarquee, scRise and the per-site
set), and prefers-reduced-motion disables all of them.

Performance: **60fps** measured over a 2 second window while the cycle runs. That
was the risk in blurring five large DOM trees, so it was measured.

Regression: 0 clipped or sub-0.9-opacity elements, wizard at 715px, quote
RM3,359, mobile never requests three, 0px overflow, zero console errors.

Not verified: I have not seen it. Whether 6.2 seconds per panel is the right
tempo, and whether the blur reads as depth or as damage, are both judgements I
cannot make. The tempo is one constant (CYCLE) if it feels wrong.
