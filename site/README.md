# HFZ Digital Advisory — single page site

Vite + vanilla JS. No framework, no SPA router. One HTML file, one CSS file,
one JS entry, and one data file holding every price.

## Commands

```bash
npm install
npm run dev       # local dev server
npm run build     # output to dist/
npm run preview   # serve dist/ locally
```

## Where things live

| Path | What it is |
|---|---|
| `index.html` | All static markup and copy. Edit headings and body text here |
| `src/data/pricing.js` | **Every price on the site.** Edit numbers here only |
| `src/main.js` | Renders ledgers from `pricing.js`, runs the quote plate, wires WhatsApp / tel / mailto |
| `src/styles.css` | Design tokens at the top, then chapter styles |
| `BRIEF.md` | Grammar, feeling curve, peak, signature move, score table |
| `src/main.js` → hero scene | Three sample pages in 3D via `CSS3DRenderer`. Desktop only, idle-loaded |
| `public/favicon.svg` | Browser icon |

## Messaging

`MESSAGING.md` holds the full framework. Read it before changing any copy.

Built bottom-up from the evidence, per the four-tier hierarchy (CVP → Strategic
Claims → Proof Points → Reasons to Believe). The rule that governs the page:

> Every sentence must ladder up to one of the four claims, or down to a number.
> If it can do neither, it is noise and gets cut.

**The four claims, each with its proof attached:**

| Claim | Proof |
|---|---|
| Every price is on this page | 48 of them, renewals included |
| The quote does not change | Scope in writing · 50 / 40 / 10 |
| The domain and hosting are yours | Registered in your name |
| SEO is priced separately | From RM800 a month |

"The domain and hosting are yours" is deliberately **not** the headline: it fails
the distinctiveness test, because every competitor could claim it. Claims 1 and 2
are the differentiators.

## The quote builder

The builder used to open empty, which asked a visitor to answer three questions
before it would tell them anything. It now opens with the answer most people
would give, so someone who agrees with all three can send it without touching a
chip, and someone who disagrees only has to change the one thing they disagree
with.

| Question | Default | Why |
|---|---|---|
| What do you need? | Website, domain and hosting | Most SMEs need the domain and hosting too, not a site on its own |
| Which website? | Business | The page already says most SMEs take it |
| Anything else? | WhatsApp integration | Section 02 argues WhatsApp beats a form; the default agrees with it |

The defaults land **one at a time** as the builder comes into view, which walks
the eye through the three questions in order. Under
`prefers-reduced-motion: reduce` they all apply at once.

### The guard

`touched` is a `Set` of the groups the visitor has answered themselves. Once a
group is in it, the defaults never write to that group again.

**The check runs at apply time, not at schedule time.** That is the whole point:
a chip clicked halfway through the stagger still wins, because the stagger
re-reads `touched` when each default is about to land rather than when it was
queued.

Verified end to end on the built page:

| Step | Expected | Result |
|---|---|---|
| On load | nothing but the site default | ✓ |
| Scrolled into view | all three defaults land | ✓ |
| Clicked "The lot, with SEO" | click wins, default does not overwrite | ✓ |
| Clicked it off again | stays off, receipt empties | ✓ |
| Chose Starter | site choice sticks, extras default survives | ✓ |

### The suggested note

While the figure is still the suggested one, the receipt says so: *"Suggested,
from what most SMEs pick. Change anything above."* It hides the moment the
visitor touches any group. A pre-filled number must never read as their own.

### Triggering it

The defaults land once the builder's top has risen past **`TRIGGER_AT = 0.55`**
of the viewport — an explicit position check on scroll, the same approach as
chapter 02's cards. Raise it to make the fill-in later.

It used to be `rootMargin: "100% 0px -15% 0px"`, which fired when the builder's
top reached 85% of the viewport — the moment it clipped the bottom edge. The
visitor scrolled it properly into view to find the defaults had already landed
and the receipt was already full.

The full-viewport margin existed to cover two cases, and the position check
covers both without special handling: **a deep link or the skip link that opens
the page below the builder leaves its top negative**, which is already past the
line, so it fires on the first check.

`runDefaults()` is idempotent, so a scroll listener firing it repeatedly is
harmless — verified with 10 synthetic scroll events per step.

**Testing note:** the iframe screenshot harness cannot test
`IntersectionObserver` reliably — the implicit root resolves against the
top-level viewport, and percentage `rootMargin`s behave oddly through the frame.
That is the second reason the position check is worth preferring here: it is the
only version that can actually be verified in this environment.

## Section 02 motion

Both miniatures in each card start in the **"before"** state. When a card comes
into view the second one **resolves**: the dim lifts, the rule goes from muted
red to the card's hue, the content sharpens, the dead button comes alive, and a
short burst fires out of it.

The point is that the improvement is something the reader *watches happen*
rather than reads about. Both halves of the comparison are true at the same
moment, which is what makes the "after" land.

- **The trigger is an explicit position check, not a `rootMargin`.** This is the
  important one. `rootMargin: "0px 0px -18%"` fired the moment a card clipped the
  bottom edge, so the whole 0.55s played out below the fold and the client
  arrived to find it already finished. Raising the margin to `-52%` then stopped
  it firing **at all** — a large negative percentage behaves unpredictably here
  and is not worth fighting.

  `main.js` now uses a plain scroll listener with arithmetic that says what it
  means: a card resolves once its top has risen past `TRIGGER_AT = 0.55` of the
  viewport. Verified: nothing fires at 80% or 65%, cards fire at 50%, stable
  after. **Raise `TRIGGER_AT` to make it later.**

- **The resolve must happen SYNCHRONOUSLY — never inside a `setTimeout`.** This
  caused a bug that took a while to read correctly. The class removal was
  originally scheduled, which left the card still carrying `.pending` through the
  delay — so **every scroll event during that window re-queued the same card**.
  Two symptoms, from one cause:
  - the burst fired over and over (looping particles), and
  - a `queue` counter that only ever incremented, so each successive card waited
    longer than the last. Cards 1 and 2 looked fine; 3 and 4 arrived late.

  Removing the class in the same tick makes the guard hold from that tick
  onward. Only the **burst** is staggered now (`i * 130`), so two cards crossing
  together read as two events rather than one flash.

  Verified by firing **12 scroll events per step** and counting sparks: exactly
  **28 = 2 bursts of 14** for two cards, and none afterwards. Before the fix the
  same probe looped.
- **`.pending` is added from JS, never written into the markup.** A failed
  script leaves every card in its finished state rather than permanently
  dimmed. Same rule as `.reveal`.
- **Both `.win.good` and `.phone.good` need the rules.** The phone card's
  miniature is a `.phone`, not a `.win`, and missing it leaves that one card
  resolving from a state that was never dimmed. The burst selector must be
  `.win.good, .phone.good` for the same reason — with only `.win.good` the phone
  card silently got no particles.
- `.win-btn` carries `border: 1px solid transparent` rather than no border, so
  the pending state can put a border on it without shifting the layout when it
  resolves.
- `.win` is `position: relative` — it is the containing block for both the
  marker dot and the sparks.
- Sparks use `var(--hue, var(--accent))`, so each card bursts in its own colour
  and the four read as four separate things resolving rather than one repeated
  effect.
- Under `prefers-reduced-motion: reduce` the cards are left resolved and no
  burst fires — `main.js` skips adding `.pending` entirely rather than relying
  on the CSS alone.

**Verifying this in headless captures:** the pending state lasts about one frame
after the scroll, and CSS transitions do not advance under
`--virtual-time-budget`, so a screenshot cannot catch either the resolve or the
sparks. To photograph the unresolved state, inject
`.win.good, .win.good::before, .win.good .win-btn, .phone.good,
.phone.good::before { transition: none !important }` and add `.pending` by hand.
To confirm the burst, count `.spark` elements **within ~500ms** of the scroll —
they are removed after 1.1s.

## Copy rules

The register is a shopkeeper explaining prices, not a brand asserting values.
`MESSAGING.md` has the long version. The short version, enforced on the page:

1. **No binary contrast** — "not X, but Y", "X, not Y". State what the thing is.
2. **No negative listing** — "none of them is an upsell, and none of them is a
   redesign". Say the positive version or cut it.
3. **No faux-insight setups** — "the one people get surprised by".
4. **No metaphor standing in for a plain verb** — "does not move" → "does not
   change".
5. **No abstract-noun headings** — "The recurring costs, in advance" →
   "Maintenance, add-ons and SEO".
6. **No em-dashes in body copy.** Colons for lists and labels, commas elsewhere.
7. **No tricolons for rhythm.** Meta lines state two facts, not three.
8. **A meta line must never repeat its paragraph.** Different information.
9. **Show, don't tell.** If a claim can be a table, a number or a document, it
   must not be a sentence. Section 02 is four before/after miniatures; section 06
   is a real scope sheet.

Rule 9 is load-bearing. The rest are hygiene.

## Verifying visually

Headless screenshots work on this machine — Chrome and Edge are both installed.
Do this before claiming a change is done.

```
chrome --headless=new --disable-gpu --hide-scrollbars --no-sandbox \
  "--screenshot=C:\\path\\to\\shot.png" --window-size=1440,1600 \
  --virtual-time-budget=11000 "http://localhost:4173/_shot.html?sel=ch-runs&off=-40"
```

Two traps, both hit:

- `--screenshot` resolves relative paths against the **CWD** and fails with
  `Access is denied` under the sandbox. Always pass an absolute Windows path.
- **Anchor navigation does not land correctly in headless**, even with
  `--force-prefers-reduced-motion`. The wrapper below is the fix: a same-origin
  page that loads the site in a viewport-sized iframe and scrolls it internally.

```html
<iframe id="f" src="/index.html"></iframe>
<script>
  const p = new URLSearchParams(location.search);
  const f = document.getElementById("f");
  f.style.width = (p.get("w") || 1440) + "px";
  f.style.height = (p.get("h") || 1600) + "px";
  f.addEventListener("load", () => {
    const cw = f.contentWindow, d = f.contentDocument;
    const el = d.getElementById(p.get("sel") || "ch-runs");
    cw.scrollTo({ top: el.getBoundingClientRect().top + cw.scrollY +
      Number(p.get("off") || 0), behavior: "instant" });
  });
</script>
```

Write it to `dist/_shot.html`, screenshot, then delete it — `dist` is build
output and it must not be deployed.

## Chapter furniture

Chapters 02-07 are built from the blocks a page in this category actually uses,
researched from Hostinger's hosting page and Cloudflare's plans page. Their
finding: a page like this is carried by **a grouped feature matrix and a long
FAQ**, with a footnote band for the fine print. Everything else is short framing.

| Block | Where | Class |
|---|---|---|
| Count band of real numbers | 03 | `.counts` |
| Package matrix, features × tiers | 04 | `.matrix` |
| Included / excluded pair | 03, 05 | `.split2.inout` + `.ticks.stack` |
| Payment band | 04 | `.band` |
| Meta line closing a step | 06 | `.runs-meta` |
| Before/after mini pages | 02 | `.flaws` → `.flaw` → `.win` / `.phone` |

**Section 02 shows rather than tells.** Each of the four failures is a card with a
before/after pair of miniature pages, built from real markup and almost no prose:
a vague hero versus a specific one, a phone frame whose content is wider than it
is, a dead grey button versus a live WhatsApp pill, and two search-result rows.
Adding those four cards *reduced* the word count.

**Grid caution:** `.spread` used to be a 7fr/3fr grid in section 02, but the
section had three children, so auto-placement gave the wide column to the chapter
number and squeezed the content into the narrow one. That is what produced a
half-empty section. A stray element at the top of a grid is enough to break it.

The count band numbers are **counted off the price list itself** (48 published
prices, 12 extensions, 3 hosting plans), not invented.

**Colour trap:** `--ink` is the *light-text-for-dark-ground* token. Any component
that hardcodes `color: var(--ink)` renders near-white inside `.chapter.paper`.
Use the inherited colour or `--paper-ink`. This already caused one invisible
"Yes" in the package matrix.

**Fixed-position trap:** the same problem applies to anything `position: fixed`,
because it crosses both grounds. `.folio` is the case in point — its default ink
is `rgba(242,243,245,0.42)`, which vanished over the paper chapters. The scroll
spy in `main.js` toggles `.folio.on-paper` to flip it to dark ink, matching the
existing convention that the accent goes monochrome on paper. If you add another
fixed element, give it the same treatment.

**Folio width trap:** `.folio` labels run to about `x=191`, and `.wrap` starts at
`(vw - 1240) / 2 + 32`. Below roughly 1680px the label collides with the content
column, so `.folio-label` is hidden between 1241px and 1679px and only the chapter
numbers show. Change the label text and you must re-check that threshold.

## Contact

**Chapter 07's `.faq-aside` is the only contact surface on the page.** The footer
that used to hold it was removed — see below.

It carries phone, email, office address, a WhatsApp pill, the languages spoken
and the copyright line. All of it is populated from `pricing.js` by the
`data-contact` / `data-whatsapp` / `data-year` handlers in `main.js`, so the
details still live in exactly one place.

### Why the footer was removed

`<footer class="colophon">` had become a second copy of things stated elsewhere:

| Footer element | Where it already was |
|---|---|
| Wordmark | The topbar `.brand` |
| "Send the quote you built (RMx)" | The receipt, directly above the send button, which already carries the whole quote in its WhatsApp `href` |
| WhatsApp link | The receipt's own `.sendline` button |
| Phone, email, address | The `.faq-aside` contact block in chapter 07 |
| "Prices in Malaysian Ringgit, exclusive of SST" | Chapter 03's closing line, the receipt's fine print, and the FAQ answer |

Two things were **not** duplicated and were relocated rather than dropped:
`English, Bahasa Malaysia or 中文` and the copyright line, both now small notes
under the contact block.

**Also cleaned up:** the `.colophon*` and `.wordmark*` rules (10 of them), the
two `getElementById("colophon-…")` calls in `main.js` that would now throw, the
`#w-skip` handler (it used to scroll to the footer; it now lands on the contact
block and focuses the WhatsApp pill), and six `href="#colophon"` fallbacks, now
pointing at `#ch-questions`.

`--ground-2` was **kept**: `.colophon` was its heaviest user but `.chip:hover`
still needs it.

Chapter 07 took an extra 44px of bottom padding, because it is now the end of
the document and the page otherwise stopped abruptly.

## Progressive disclosure

Every list on the page uses one component: `details.group` with a
`summary.group-head` (name, mono meta line, a ringed `+` that rotates to `−`)
and a `div.group-body`. Native `<details>`, so no JS, keyboard accessible, and
collapsed content stays in the DOM for search.

- **9 groups, 4 open by default** — Domain, Hosting, Packages and Maintenance,
  the things a visitor actually came for. The rest show their count and starting
  price in the head line, so a closed group still carries a number.
- The domain table splits: **6 common extensions visible, 6 behind a nested
  `.fold`**.
- Net effect: **50 price rows in the DOM, 10 visible on load.**
- If you add a group, follow the same shape: head carries the count and the
  "from" price, body carries the detail. Wrap the price in `<b>` — a collapsed
  row's most useful number should carry the ink.

**Two traps, both hit:**

1. **Never `fill()` a `<table>`.** `fill()` sets `innerHTML`, and `innerHTML` on
   a table element destroys its `<thead>`. The domain table rendered for weeks
   with no "Register / year" / "Renew / year" column headers and nobody noticed,
   because a headerless price table still looks plausible. `fill()` the
   `<tbody>`.
2. **Do not animate `block-size` through `::details-content`.** It looks like
   the clean way to make `<details>` ease open, and Chrome supports it. Measured
   on this page, the panel sized itself to **172px against 191px of content** and
   clipped the last row. The page uses a transform + opacity fade on
   `.group-body` instead, which cannot hide anything. The fade starts at `0.6`,
   not `0`, so a frame caught mid-animation is still legible.

## The hero language

Taken from the three reference screenshots supplied (Sonder Studio, Valcère,
Glaido). Four devices are common to all three:

1. **Corner label rails** — small mono uppercase labels with hairline rules.
2. **A headline that changes voice mid-sentence** — grotesque for the statement,
   italic serif for the emotional half (`--font-serif`).
3. **One accent and one marker** — `#E9F94A` plus the round dot.
4. **A dark ground with hairlines** — `#0B0C0E`, not a light grey page.

Tokens: ground `#0B0C0E`, accent `#E9F94A`, paper `#F3F4F6`. The light surface is
the **exception**: only `.chapter.paper` prints light, so the dark reads as a
decision. Anything white-on-white (the receipt) sets its own ink context.

## Design system

Grammar: **chaptered editorial**, from the `scroll-craft` skill. The page is a
printed rate card. Chapters are the unit, not acts.

- **No scroll engine.** `scrollcraft.js` was wired in and then removed. Its
  `data-sc-reveal` wipe is driven by act progress, and on short flow chapters the
  wipe never completed, leaving `<h2>`s clipped to a fraction of their height.
  All entrance motion is now a plain IntersectionObserver, applied from JS so a
  failed script leaves the text visible rather than invisible.
- **No `scrub`, no `pin`, no `spotlight`, no `magnet`,** no continuous `drift`.
  Chapters change ground with a hard cut (paper / ink).
- The signature move (chapter 01, the quote plate) is bespoke JS in
  `src/main.js`. It reads from the same `pricing.js` as the printed rate card, so
  the receipt can never disagree with the table.
- Chapter 01 sits just below the fold on purpose. The rate card that follows is
  the evidence for the number the reader just built.

## Colour

The page was monochrome plus one acid yellow. It now carries a small functional
palette — every hue means something, and none of them are decoration.

### Category hues

Four kinds of thing, four hues. Applied to the group icons and to the data bars,
so a section tells you what kind of work you are looking at before you read it.

| Hue | Value (dark) | Value (paper) | Covers |
|---|---|---|---|
| `--hue-infra` | `#5ec8f0` sky | `#0a5f85` | Domain, Hosting, Business email |
| `--hue-product` | `#b5a1ff` lilac | `#4c34ad` | Packages, What each package includes, Larger builds |
| `--hue-care` | `#4ee0a0` mint | `#076b45` | Maintenance, Starter bundles |
| `--hue-growth` | `#e9f94a` | `#5a6400` | Add-ons, SEO & marketing |

**Every hue needs two values.** A colour light enough to glow on `#0b0c0e` is
far too light to pass contrast on `#f3f4f6`. The paper chapters switch to the
`-ink` value via `.chapter.paper .hue-*`. Never use a bare hue on paper — there
is a check for it in `_check.cjs`'s pattern if you extend the palette.

A hue class sets `--hue` **once**, and everything inside reads it: the icon, and
the bars behind the rows. One assignment per group rather than a rule per
element. Add a group by adding `hue-infra` (etc.) to its `<details>`.

### Ground tints

A hue on a 22px icon reads as detail. A hue on the whole chapter reads as
colour. Each dark chapter carries a wash of its hue, and the two paper chapters
are separated into cool and warm.

| Chapter | Ground |
|---|---|
| 02 | `--ground` (neutral) |
| 03 | `#091520` cool |
| 04 | `--paper` cool grey |
| 05 | `#091813` green |
| 06 | `--paper-warm` `#f7f3ec` cream |
| 07 | `#100c1c` violet |

**Keep these within about 12 points of the base ground.** Any further and the
hairlines and ghost numerals start sitting on a colour rather than on a ground,
and the page stops reading as a printed document.

### Section 02

Its four cards take a hue by position (`nth-child`), because they are not
categories — the hue is there to separate them at a glance and to get colour
into the one long chapter that was still pure monochrome. If you reorder the
cards, reassign the hues.

### What is deliberately still monochrome

Body copy, headings, prices and the ledger rules. The prices are the product and
the hairlines are the structure; colouring either would make the page shout
instead of state. Colour marks **categories and states**, never content.

## The ledger

The page is a rate card, so the price lines carry the design. One idiom, used
everywhere a name meets a number:

- **`.ledger-rows .row`** — name, dotted leader, price. Flex, so the leader
  stretches.
- **`.ledger` table** — same idiom inside a real `<table>`, for the domain
  prices where there are two figures per row. Uses `table-layout: fixed` so both
  price columns keep their widths instead of being starved by the flexible
  extension column. Both price columns are fixed rather than auto, so the
  continuation table under the "other six extensions" fold lines up with the one
  above it.
- The rightmost figure takes `padding-right: 0` and sits flush with the container
  edge, which is the printed-ledger convention and also opens the gap between
  the two column headers.
- Below 700px the price columns shrink, the headers are allowed to wrap again
  and the leader is dropped — otherwise the two fixed columns starve the
  extension column to nothing.

The prices are the product, so they are set in the mono face with
`font-variant-numeric: tabular-nums` everywhere they appear, and the tier prices
are the largest type in their column.

## Dividers

**Never draw a divider as a `border-left` or `border-right` on the cell.** A
border belongs to the element, so it can only ever be flush against one side:
`border-right` lands against the next cell's text, `border-left` against the
previous cell's. Whichever you pick, half the row has no breathing room, and the
text butts against the line.

The page draws every vertical divider **in the gap between cells** instead:

```css
.row { display: grid; grid-template-columns: repeat(4, 1fr); column-gap: 30px; }
.row li { position: relative; }

.row li + li::before {
  content: "";
  position: absolute;
  left: -15px;          /* half the gap, so the rule is centred in it */
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--rule);
}
```

That gives equal room on both sides, keeps the first cell flush with the
container's left edge and the last flush with its right, and needs no
`:first-child` / `:last-child` exceptions. Used by `.counts` and `.claims-row`.

In a 2×2 layout the rule belongs only before column two of each row, so the
`+` selector is switched off and `:nth-child(even)` is used instead.

This applies to horizontal rules too: any `border-top` or `border-bottom` that
acts as a separator needs padding on the side the content sits, which is why
`.group-head`, `.band`, `.faq details` and `.contact-list li` all carry vertical
padding alongside their rule.

## Icons and graphics

The page is a rate card, so the first version was all typography. The answer is
**not photography** — the page's whole claim is that it publishes facts, and
stock imagery undercuts exactly that. The answer is a graphical vocabulary built
from the data.

### The icon set

One inline SVG sprite at the top of `<body>`, referenced with `<use>`. Rules,
from the icon-design guidance:

- **One grid.** 24×24, content inside a 3px margin.
- **One stroke weight.** 1.5, on every path including internal details. The
  moment one icon is thinner the whole set looks broken.
- **One cap and join style.** Round, everywhere.
- **One style.** Outline only. If you add a filled state, convert the whole set
  so the geometry is shared.
- **Colour from `currentColor`**, so an icon always matches the ink of whatever
  it sits in and needs no per-context override.
- **Obvious metaphors.** Globe for domain, server stack for hosting, envelope
  for email, shield for maintenance. Clever beats clear far less often than
  people hope.

Used in: the counts band, all ten `details.group` heads, the four process steps,
and the package matrix. Adding an icon means adding a `<symbol>` and a `<use>` —
and if you add one, check nothing is left unused, because a padded set drifts.

**The one exception:** `i-whatsapp`. It is a *filled* brand mark, not a redraw in
the house style, because its exact silhouette is what makes the channel
recognisable — a hand-drawn approximation would be worse than useless. Use it
with `.ico-brand`, which switches fill on and stroke off. Do not add a second
brand mark without asking whether the page needs it.

### The WhatsApp button

`.sendline` in the receipt was an underlined text link — the weakest possible
affordance for the single most important click on the page. It is now a filled
pill with the brand glyph.

It is **the only element on the page that uses a colour outside the palette.**
That is deliberate and it should stay that way: the palette is monochrome plus
one accent, and the one place a second colour earns its keep is the action you
most want taken.

The text is dark green, not white. **White on `#25d366` measures 1.99:1 and
fails AA.** Dark green `#062b16` measures 7.74:1. If you restyle this button,
re-check that ratio — it is the obvious mistake to make here.

### The package matrix

This is the table that used to read `Yes / No / Yes` straight down the page.

| Device | What it does |
|---|---|
| Check glyph | Replaces `Yes`. Wording stays in the DOM behind `.vh`, so screen readers and search still get it. |
| Dash glyph | Replaces `No`. Kept lighter than the check so included reads first. |
| `.dots` | The Pages row. 5, 10 and 15 drawn as countable dots on a shared 15-slot track, so the step is visible without reading three numbers. |
| `.lvl-meter` | The SEO row, which is a level rather than a yes. A three-step meter plus the label. |
| Column tint | Column 3 (Business) is tinted so it reads as a *column*, not just a bolder heading. |
| Row hover | `rgba(14,17,22,0.025)`. The column rule deliberately outranks it, so the featured column stays lit while you scan a row. |

The dots and the meter are **built by script** from `data-qty` / `data-lvl`. The
wording is already in the markup, so nothing is lost if the script does not run.

### The rest

- **`.split-bar`** — the payment schedule as one proportional bar. Three numbers
  state a split; a bar shows it, and the 10% looks as small as it is.
- **`.runs` rail** — a hairline threaded through the four steps, with the step
  icon sitting on it as the node.
- **`.row-bar`** — faint data bars behind the hosting and maintenance rows,
  where the list is a set of comparable tiers. Deliberately not used on the
  add-on or SEO lists: those are a menu, not a scale, and bars there would imply
  a comparison that does not exist.

### What was removed, and why

A **renewal chart** was built and then deleted. It plotted first-year price
against renewal price for all twelve extensions, sorted by the size of the jump,
which put `.store` at RM39 → RM425 (10.9×) at the top. It was honest data and it
was a **self-own**: HFZ resells domains, and a chart whose whole message is "the
renewal price is the trap" argues against HFZ's own renewal prices. The page is
not a comparison site and the brief is that both the register and the renewal
price are good value. Do not rebuild it. The exact figures stay in the domain
table, where they are a price list rather than an argument.

## Evidence

Section 02 is the only part of the page that makes claims about the world rather
than about HFZ, so every card carries its source, linked, under the claim.

| Card | Source | Finding |
|---|---|---|
| 01 The offer | Nielsen Norman Group | Visitors leave a page in 10–20 seconds unless the value is clear. |
| 02 The phone | Google, *The need for mobile speed* (2016) | 53% of mobile visits are abandoned if a page takes over 3 seconds. |
| 03 The contact path | Baymard Institute | After 14 years of testing, the flow itself is often the sole cause of abandonment. |
| 04 Google | Google Search Central | The title link is "often the primary piece of information people use to decide which result to click". |

Rules for this section:

- **Each card states the failure, then shows it, then cites it.** The earlier
  version was four unlabelled before/after pairs under abstract headings ("The
  offer", "The phone") — the idea was there but nothing said what was wrong,
  which is what made the messaging read as confused. The miniatures now carry
  `Before` / `After` labels, because two unlabelled boxes do not communicate.
- **Only the source name is the link**, not the finding. Underlining the whole
  sentence made it unclear what was clickable.
- **Cite what the source actually says.** Card 02's source is about load speed,
  not responsive layout; the card states the layout problem from its own
  miniature and the source is a supporting fact. Do not let a citation appear to
  prove a claim it does not make.
- **Never add a fifth claim without a source.** If it cannot be sourced, it gets
  cut.

## The hero scene

The hero **is** the scene. Six **standalone sites** live in `public/samples/`,
each a real page with its own URL, its own title, its own scroll behaviour and
its own parallax. The hero frames them in same-origin iframes inside 3D panels at
1440x900 scaled to 0.3, and drives each framed page's scroll while it is on
stage.

### Panel tilt: negative `ry`, and how to verify it

**`ry` must be NEGATIVE in every state** (`SWIPE`, `LIVE`, `BACK`, `PARK`).
Negative `ry` renders with the **right edge taller** — the right side nearer the
camera, so the panel slopes inward toward the copy. That is the shape the client
asked for.

**Do not derive this from the three.js sign convention. Measure it.** I got it
backwards twice by reasoning about it, and shipped the wrong direction both
times. The three.js Y-rotation sign does not match what lands on screen here.

The reliable test, and the only one that worked:

1. Set `LIVE.ry` to **-1.2** and build.
2. Screenshot at 1440.
3. The right edge should be roughly **1.5× the height of the left** (measured:
   367px vs 247px). If it is the other way, the sign is wrong.

Small angles are not verifiable by eye. At `-0.18` the difference is ~15%, which
is inside the error of reading a downscaled screenshot — I misread it three
times. Only the extreme test settles it.

### The camera must aim straight ahead

`camera.lookAt(0, 0, 0)`, **not** `lookAt(group.position.x * 0.55)`.

This was the actual cause of the "the slope flips depending on window size"
report. A yawed camera views the panel off-axis, and an off-axis flat plane
projects as a trapezoid — so the camera was contributing a slope of its own on
top of `ry`, and its size changed with the viewport because `group.x` is
aspect-dependent. At some widths the two cancelled, at others they compounded.
Aiming at the origin leaves `ry` as the only thing that can tilt the panel.

### The panel is a constant PHYSICAL size, not a constant fraction

**The panel is portrait, 9:16.** `.panel` is 300×533 and the framed page is
rendered at a **portrait viewport (900×1600)**, not the 1440×900 desktop one, so
the sample sites lay out for a tall screen instead of being cropped to a slot.
The samples use `max-width` containers and reflow well at 900 — a handful of
fixed-width elements inside them overflow and are clipped, which reads as a page
wider than its window. Checked directly: `/samples/fern.html` at 900×1600 looks
correct.

**The taller frame loads more slowly.** It renders a 3284px-tall page rather
than a 900px one, so the poster stays up longer on first load. In headless
captures the content did not appear until ~22s of virtual time; earlier
screenshots showed the dark poster and looked like a bug. If you are verifying
this visually, **wait** — do not conclude the frame failed to load. The probe is
the fast check: the live panel should carry `.ready` and its iframe a `src`.

**Size is pinned by HEIGHT, `TARGET_H = 0.7` of the viewport.** Four attempts
got here:

1. **Fixed world size** — grew as a *share* of the screen as the viewport
   narrowed. ~49% at 1080.
2. **Constant fraction** — fixed at 30% everywhere. Wrong instinct, and it looks
   right in a table: the share is constant, the physical size is not. 614px wide
   on a 1920 screen, 345px on a 1080 one. Client: *"too big in widescreen while
   tiny in smaller viewport."*
3. **Constant pixel width** — correct in principle, but **width is the wrong
   thing to pin for a portrait panel.** At 300px wide it was 533 tall, which
   left a void to its right at both sizes.
4. **Constant fraction of viewport height** — what a portrait panel actually
   needs. It fills the hero's height at every viewport and the width follows
   from the aspect.

`screenPx = worldSize / (2 * half) * viewportHeight`, so solving for the scale
that lands `TARGET_H * viewportHeight` on screen reduces to
`(TARGET_H * 2 * half) / PANEL_H`.

**`TARGET_H` may exceed 1, but the settled value is 0.7.** Values of 0.95, 1.1
and 1.25 were all tried and each read as too big; 0.7 fills about 73% of the
viewport height at every width, sits clear of the hero's top and bottom edges,
and leaves the framed page legible. Treat 0.7 as the tuned value and change it
only if asked.

If you do raise it, **check the framed page still paints.** At `TARGET_H = 1.25`
the panel stopped rendering its content in headless captures even with a 40s
budget, while 0.7 and 0.95 both painted. Whether that is a threshold or
flakiness is unconfirmed.

**Position: the panel's right edge is aligned to the content column.**

Six earlier attempts all positioned the panel relative to the *window* — a
fraction of the visible half-width, tuned by eye at 0.44 then 0.38 — and the
result was that the panel had no relationship to the page's own grid. The client
marked both failures by drawing the column's edges onto a screenshot: the panel
**overflowed** the `.wrap` column on a wide screen and **fell short** of it on a
narrow one.

So `stageX()` derives from the column, not the viewport:

- The column is `.wrap`: max-width 1240 with 32px of padding, centred, so its
  right edge sits `(1240 / 2) - 32 = 588px` from the viewport centre —
  `CONTENT_RIGHT` — or `viewportWidth / 2 - 32` once the window is narrower than
  the wrap.
- The panel's projected half-width is then subtracted from that.

**`PANEL_SPREAD = 1.9` is empirical, not derived.** A Y-rotated panel's on-screen
footprint is much wider than `W * cos(yaw)` suggests, because its top and bottom
edges slope and the corners swing out sideways. Measured against the live page,
the real footprint is about 1.9× the naive estimate. **If the panel starts
crossing the column edge again, re-measure it — do not re-derive it.**

Verified inside the column at six widths, with 22–65px of slack:

| Viewport | panel right | column right |
|---|---|---|
| 1080 | 1019 | 1048 |
| 1300 | 1216 | 1238 |
| 1440 | 1286 | 1308 |
| 1920 | 1515 | 1548 |
| 2400 | 1744 | 1788 |
| 3440 | 2243 | 2308 |

The **folio** (the 01–07 chapter index) is deliberately *outside* the column, on
the far left. The client confirmed that is fine — do not pull it in.

`stageX()` and `stageScale()` are both called from the **resize handler**. Miss
that and the panel drifts and changes size as the window is resized.

`stageScale()` is applied in `place()`, **not** to the group. Scaling the group
would also scale the state z offsets, which changes the perspective as the panel
resizes. Scaling the object leaves the depth relationship alone.

**The slope is deliberately extreme.** `LIVE.ry = -0.95` (~54°). The brief was
"like a wall in an alley", and three earlier, gentler attempts were rejected.
Do not soften it.

Everything above depends on the camera looking straight ahead; see the `lookAt`
note in the render loop.

### A trap that cost real debugging time

`stageX()` referenced `PANEL_W`, which **had never been declared** — an earlier
edit dropped it when the size target moved from width to height, and nothing
referenced it until `stageX()` did. `const` is not hoisted, so this is a
**temporal dead zone error**, not an undefined variable.

Two things made it expensive:

1. **The build passes.** Vite cannot see a TDZ error, so `vite build` reports
   success on a page whose hero is completely dead.
2. **The failure is silent and total.** `paint()` throws on its first call, so
   `host.classList.add("ready")` never runs and the rAF loop never starts: no
   live panel, no error in the DOM. The only symptom is an empty hero.

**If the hero goes blank after touching `scene.js`, attach a `window.onerror`
listener in `<head>` before the module runs and read the message.** An
`unhandledrejection` listener catches it — the module is an async IIFE, so the
throw surfaces as a rejected promise, not a classic error.

### Motion: two curves, and a static hold

**Entry and exit use one plain cubic each. The hold is completely static.**

There used to be a "juice kit" here — `easeOutBack` and `easeInBack` for
overshoot and anticipation, a damped `settle()` oscillation, an `overshoot`
envelope and a per-cycle random `seed` — added on the game-feel theory that
overshoot reads as weight. It does, on a small panel. On one this large the
client's words were *"it feels unstable like im at the open seas"*, which is
exactly right: the hold ran a ±46-unit depth wobble, a ±6 vertical bob, a scale
pulse and a yaw wobble for the first third of every cycle, with the amplitude
re-rolled each time.

All of it is gone. Verified by sampling the live panel's `matrix3d` across a
full hold window: **yaw drift 0.0000, scale drift 0.0000, depth drift 0.0000,
height drift 0.0000.**

**Do not reintroduce overshoot without watching it at full size.** The helpers
are deleted, not disabled, so adding them back is a deliberate act.

**Pointer parallax is deliberately small:** `PARALLAX = { x: 44, y: 18, z: 40,
ease: 0.08 }`, down from 130 / 50 / 90. At 130 the camera yawed about 7.4° at
full deflection, which swung the whole scene and read as the page pitching. If
it still reads as swaying, set `PARALLAX` to zero and the scene becomes fully
static — a hero that does not respond to the pointer at all feels dead, which is
why it is reduced rather than removed.

**Note on verifying this in headless captures:** `--virtual-time-budget`
advances timers far faster than it produces frames, so a `setTimeout` probe sees
the scene apparently frozen and two captures at different budgets can come back
byte-identical. That is an artifact, not a stalled animation, and it predates
the motion change. Do not conclude the carousel is stuck from a headless
capture.

The h1 carries a `<br>` after "it," so it breaks as "If you can imagine it," /
"we can build it." rather than stranding "we" on the first line. Below 600px the
break is suppressed (`display: none` on the `br`), because the first half no
longer fits on one line and the forced break left "it," alone.

- Open one directly: `/samples/fern.html`, `/samples/morsel.html`,
  `/samples/rakan.html`, `/samples/umrah.html`.
- `sample.css` and `sample.js` are shared by all four. `sample.js` reveals
  sections on scroll and publishes `--mp`, which the parallax layers consume.
- Frames load lazily: only the panel on stage and the next one get a `src`.
- The hero rail **names** the site currently on stage but deliberately does not
  link to it. That was a client call: the panels illustrate what we build, they
  are not a portfolio to send visitors away for. `setLive()` in `scene.js` still
  resolves the name from `.poster b`, so if the link is ever restored the only
  missing piece is the `href` assignment that used to sit beside it.

Each one has its **own structure**, not the same skeleton recoloured:

| Class | Site | Structure |
|---|---|---|
| `p-fern` | Sleepwear · from theirnibs.com | Print-led shop: full-bleed hero, collection tiles, product grid with badges, ratings, size pills and prices |
| `p-morsel` | Cookies · from partakefoods.com | Bright snack brand: split hero on a colour field, allergen badge pills, product grid, proof band, testimonials, newsletter |
| `p-vita` | Umrah travel · from vita-travel.webflow.io | Full-bleed photographic hero with a 148px serif display word and a 4-up stat rail; an "Islamic travel, included" feature grid; Umrah packages with prices, durations and walking distance to the Haram; a 01–04 process; mutawwif cards. Class prefix stays `v-` from when this was a wellness-travel sample |
| `p-rakan` | Agent platform · from cofounder.co | Painted world, light ground. Rounded illustrated hero with a pill nav and a floating product card, then three zigzag chapters (Launch / Grow / Operate) each with its own UI panel, a department grid, an animated letter grid and guide cards |

**Every sample is built from a supplied reference.** The six invented ones
(Utama, Ampersand, Kopi, Northbridge, Lumen, Halcyon) were removed at the client's
request; each was a structure I made up and the results read as generic. The four
that remain each come from a real site the client pointed at, which is also why
they look like distinct sites rather than one template recoloured. Keep it that
way: a new sample starts from a reference and a screenshot, not from a palette.

Page heights run 3326 to 6187 and section counts 9 to 11, on purpose. Adding a
site means giving it a structure, not a palette.

**`sample.css` must define every variable it uses.** Each sample is a standalone
document that links only this file, so a custom property defined solely in
`src/styles.css` resolves to nothing and the whole site silently falls back to the
browser default face. The four font variables live at the top of `sample.css` for
exactly this reason. When splitting CSS across files, audit `var(--…)` per file.

`sample.js` also carries a generic cursor-tilt handler, currently unused: put
`data-tilt="N"` on any card and the pointer offset inside it becomes
`rotateY`/`rotateX` plus a `translateZ` lift, with the shadow offset written to a
`--sh` custom property sign-inverted so it swings opposite the tilt. It no-ops when
no `[data-tilt]` element exists, and is skipped under `prefers-reduced-motion` and
on coarse pointers. It was built for the Tabela sample, which was removed.

`p-rakan` is the illustration-led sample: two hand-painted scenes (`meadow` in the
hero, `hillside` in the mid-page band) on a warm light ground, with the product UI
laid over the painting rather than pasted on top of it. Its three product chapters
each carry their own real UI panel — a task list with stage counters, an email
preview with a campaign report, and a twelve-bar chart — so no screenshot of an
interface is ever used to show an interface.

`p-fern` and `p-morsel` are the two samples with photography. Their images live in
`public/samples/img/` as WebP and were generated from one reused style preamble
per brand so each set reads as a single shoot. Product prompts deliberately
exclude text and packaging: generated lettering is unreliable, and a fake brand
name printed on a pack looks worse than no pack at all. Source PNGs are not kept;
re-convert with ffmpeg if you regenerate.

- Full bleed: `.scene` is `position:absolute; inset:0` inside `.titlepage`.
- Layer order: copy `z-index: 3`, `.hero-scrim` `2`, `.scene` `1`.
- The scrim is a 100-degree gradient, solid over the left 26% and transparent by
  76%, so the copy stays readable and the sites stay visible on the right.
- **One panel in focus at a time**, on a continuous stage timeline rather than an
  index, so the exchange overlaps: one reverses out while the next swipes in.
  Nothing is ever static while something else leaves.
  - `x` from -0.19 to 0: swipes in **from stage right** (world x +760, rotateY -0.34, opacity 0 → 1, blur 7 → 3.5)
  - `x` from 0 to 0.81: holds at `z +180`, micro-animation running
  - `x` from 0.81 to 1: exits **to stage left** (world x -430, `z -820`, scale 0.6, fading)
  - Travel is one direction, right to left, and parked panels sit left, where
    panels exit — so the exchange reads as a conveyor, not two panels swapping.
- **The motion is eased, not interpolated.** Plain cubic easing is why an
  exchange reads as rigid: the panel arrives and stops dead, the same way every
  time. `src/scene.js` carries a small juice kit:
  - `easeOutBack` on entry — scale and yaw overshoot ~2.8% past the target and
    settle back. This is the single biggest lever; below ~2% it is invisible.
  - `easeInBack` plus a wind-up bump on exit — the panel nudges 18-28px the
    wrong way before it goes. Anticipation, and it makes the exit land harder.
  - `settle()` on the hold — a damped oscillation on z, scale and yaw for the
    first third, so it lands rather than stops.
  - `seed` — a random value rerolled every cycle modulating the overshoot and
    the wind-up, so no two exchanges are identical. Cheapest anti-mechanical
    lever there is.
  - Reference: *Juice it or lose it* (GDC 2012) and *The Art of Screenshake*
    (GDC 2013); the graph is the easing curve, a.k.a. slow-in/slow-out.
- **Softness is applied inside the framed document, never on the panel.** At 0.3
  scale the framed site's own headline competes with the page headline, so every
  panel is blurred — 3.5px when on stage, 7-9px when off. The hero writes
  `--blur` and toggles `.is-soft` on the iframe's own `documentElement`, and
  `sample.css` holds the rule: `html.is-soft { filter: blur(var(--blur, 3px)) }`.
- **Never put a CSS `filter` on an ancestor of a scrolling iframe.** Chromium
  pushes the frame into a filtered compositing layer and then fails to repaint
  the tiles it exposes while scrolling, leaving white gaps — that is what broke
  Rakan and Vita. Filtering the frame's *own* root avoids the cross-document
  compositing path entirely. `LIVE_BLUR` in `src/scene.js` is the one dial.
- There is no scrim or dimming overlay on the stage. The blur carries the whole
  job: 3.5px on stage, 7-9px off, at full opacity. One mechanism, not two.
- The stage is offset +350 and the copy capped at 560px, so the live panel clears
  the headline.
- Each site has its own hold animation, gated on the is-live class: plate
  parallax, staggered rows, clip-path wipes, a spinning roundel, sliding arrows,
  marquee tickers, pulsing CTAs.
- Each framed page scrolls itself while it is on stage, and publishes its
  progress as the `--mp` custom property, which the sample sites consume in
  `calc()` for real scroll-linked parallax.
- **Only a short stretch is shown.** `TRAVEL = 640` px of the framed page over
  `CYCLE = 3800` ms, so roughly 3 seconds of slow drift. Scrolling an entire
  multi-thousand-pixel page in that time is a blur, not a look at the site. Both
  constants are at the top of the scene block in `src/scene.js`.
- **Every panel is driven, not just the live one.** A panel that is not live is
  still on screen during its swipe-in, so it is held at scroll `0`; otherwise it
  is seen at the position it finished on last cycle and then jumps to the top.

- three is a **separate chunk, ~187 kB gzipped**, fetched on `requestIdleCallback`.
- Below 900px the scene is skipped entirely and three is never downloaded.
- `prefers-reduced-motion` renders one static frame and stops.
- The scene deliberately breaks the grammar's "no media above the fold" rule,
  because it was requested. See `BRIEF.md` if you want strict compliance back.

Prices are rendered from `pricing.js` so a non-developer can change a number
without touching markup. Domain rows where renewal is more than double the
registration price are highlighted in the table automatically.

## Deploy to GitHub Pages

**Live at <https://rajahafify.github.io/hfz-digital-advisory/>** —
repo <https://github.com/rajahafify/hfz-digital-advisory>.

The workflow at `.github/workflows/deploy-pages.yml` builds and deploys on every
push to `main`. Nothing to do by hand: commit and push.

### Why it is public

GitHub Pages on a free account only serves public repos. A private repo needs
Pro. The site is a marketing site, so public is the intent, not a compromise.

### How it was set up

```bash
gh repo create hfz-digital-advisory --public --source=. --remote=origin
git push -u origin main
gh api -X POST repos/rajahafify/hfz-digital-advisory/pages -f build_type=workflow
```

That last call is the one people miss. The workflow uploads a Pages artifact,
but the repo setting must already say **Source → GitHub Actions** or the deploy
job 404s. `actions/configure-pages@v5` does not set it; only the API or the
Settings UI does. Setting it up front avoids a failed first run.

### Base path

The workflow sets `BASE_PATH=/${{ github.event.repository.name }}/`, read from
the event rather than hardcoded. Rename the repo and the next push fixes the
asset URLs automatically.

### Custom domain

Add a `public/CNAME` file containing the domain, remove `BASE_PATH` from the
workflow build step, and point the domain at GitHub Pages per GitHub's docs.
Note the Pages site currently has `https_enforced: true` — a custom domain will
need a valid cert before it serves.

### Custom domain

Add a `public/CNAME` file containing the domain, remove `BASE_PATH` from the
workflow build step, and point the domain at GitHub Pages per GitHub's docs.

## Deploy to cPanel instead

```bash
BASE_PATH=/ npm run build
```

Upload the contents of `dist/` into `public_html`. No Node on the server
required — the output is static files.
