import {
  company,
  domains,
  hosting,
  hostingFeatures,
  emailServices,
  websitePackages,
  extraBuilds,
  maintenance,
  addons,
  bundles,
  seoServices,
} from "./data/pricing.js";

const rm = (n) => `RM${n.toLocaleString("en-MY")}`;
const fill = (id, html) => {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
};

// A ledger row: name, dotted leader, price. Print idiom, no cards.
const row = (name, price, unit = "") =>
  `<div class="row"><span class="row-name">${name}</span><span class="dots"></span><span class="row-price">${price}${
    unit ? `<em>${unit}</em>` : ""
  }</span></div>`;

/* ---------- chapter 02: rate card ---------- */

const domainRow = (d) =>
  `<tr>
        <th scope="row"><span class="ext">${d.tld}<i class="dots"></i></span></th>
        <td>${rm(d.register)}</td>
        <td class="${d.renewal > d.register * 2 ? "warn" : ""}">${rm(d.renewal)}</td>
      </tr>`;

// Where a list is a set of comparable tiers rather than a menu of separate
// services, each row gets a data bar behind it. The bar is the same number the
// row already states, so it adds no claim — it just makes the step between the
// tiers visible without reading three figures.
const barRow = (name, price, unit, max) => {
  const v = Number(String(price).replace(/[^\d]/g, ""));
  return `<div class="row row-bar" style="--v:${((v / max) * 100).toFixed(1)}%">
    <span class="row-name">${name}</span>
    <span class="dots"></span>
    <span class="row-price">${price}${unit ? `<em>${unit}</em>` : ""}</span>
  </div>`;
};

const barList = (items, max) =>
  items.map((i) => barRow(i.name, i.price, i.unit || "", max)).join("");

const money = (s) => Number(String(s).replace(/[^\d]/g, ""));

// six on show, six behind a disclosure: the wall of numbers is what made this
// chapter read as noise rather than as a price list.
// Fill the <tbody>, never the <table> — innerHTML on the table wipes the
// <thead>, which is how the register/renew column labels went missing.
const COMMON = 6;
fill("domain-table-body", domains.slice(0, COMMON).map(domainRow).join(""));
fill("domain-table-rest-body", domains.slice(COMMON).map(domainRow).join(""));

const hostingMax = Math.max(...hosting.map((h) => money(h.price)));
fill(
  "hosting-list",
  hosting
    .map((h) => barRow(h.name, h.price.replace(" / year", ""), "per year", hostingMax))
    .join("")
);

fill("hosting-features", hostingFeatures.map((f) => `<li>${f}</li>`).join(""));

fill("email-list", emailServices.map((e) => row(e.name, e.price, e.unit)).join(""));

/* ---------- chapter 03: websites ---------- */

fill(
  "package-grid",
  websitePackages
    .map(
      (p) => `<article class="tier${p.featured ? " featured" : ""}">
        <p class="badge">${p.featured ? "Most chosen" : ""}</p>
        <h3>${p.name.replace("HFZ Website ", "")}</h3>
        <p class="price">${p.price}</p>
        <ul>${p.scope.map((s) => `<li>${s}</li>`).join("")}</ul>
      </article>`
    )
    .join("")
);

fill("extra-builds", extraBuilds.map((b) => row(b.name, b.price)).join(""));

/* The matrix states its quantities in words. A dot row makes the step between
   5, 10 and 15 pages visible without reading three numbers, and a three-step
   meter does the same for the SEO level. Both are enhancements on top of the
   wording already in the markup, so nothing is lost if this does not run. */
const meter = (n, max, cls) => {
  let out = `<span class="${cls}" aria-hidden="true">`;
  for (let i = 0; i < max; i += 1) out += `<i${i < n ? ' class="on"' : ""}></i>`;
  return `${out}</span>`;
};

document.querySelectorAll(".matrix td.qty").forEach((td) => {
  const n = Number(td.dataset.qty);
  const max = Number(td.dataset.max || 15);
  td.insertAdjacentHTML("afterbegin", `${meter(n, max, "dots")}<b>${n}</b>`);
});

document.querySelectorAll(".matrix td.lvl").forEach((td) => {
  td.insertAdjacentHTML("afterbegin", meter(Number(td.dataset.lvl), 3, "lvl-meter"));
});

/* ---------- chapter 04: the rest ---------- */

const maintMax = Math.max(...maintenance.map((m) => money(m.price)));
fill(
  "maintenance-list",
  maintenance
    .map((m) => barRow(m.name, m.price.replace(" / year", ""), "per year", maintMax))
    .join("")
);
fill("bundle-list", bundles.map((b) => row(b.name, b.price)).join(""));
fill("addon-list", addons.map((a) => row(a.name, a.price)).join(""));
fill("seo-list", seoServices.map((s) => row(s.name, s.price)).join(""));

/* ---------- contact ---------- */

const waBase = `https://wa.me/${company.whatsapp}`;
const tel = `tel:${company.phone.replace(/\s/g, "")}`;
const mail = `mailto:${company.email}`;

document.querySelectorAll("[data-whatsapp]").forEach((el) => {
  el.setAttribute("href", waBase);
  el.setAttribute("target", "_blank");
  el.setAttribute("rel", "noopener");
});
document.querySelectorAll('[data-contact="phone"]').forEach((el) => {
  el.setAttribute("href", tel);
  el.textContent = company.phone;
});
document.querySelectorAll('[data-contact="email"]').forEach((el) => {
  el.setAttribute("href", mail);
  el.textContent = company.email;
});
document.querySelectorAll('[data-contact="address"]').forEach((el) => {
  el.textContent = company.address;
});
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = `© ${new Date().getFullYear()} ${company.name}`;
});

/* ---------- chapter 05: the quote plate (signature move) ---------- */

const amount = (s) => {
  const m = String(s).replace(/,/g, "").match(/RM\s?(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : null;
};

const NEEDS = [
  { id: "site", label: "Just a website" },
  { id: "site+infra", label: "Website, domain and hosting" },
  { id: "full", label: "The lot, with SEO" },
  { id: "unsure", label: "Not sure yet" },
];

const SITES = websitePackages.map((p) => ({
  id: p.name,
  label: p.name.replace("HFZ Website ", ""),
  price: amount(p.price),
}));

const EXTRAS = [
  { id: "wa", label: "WhatsApp integration", price: amount(addons[3].price) },
  { id: "ga", label: "Google Analytics", price: amount(addons[4].price) },
  { id: "speed", label: "Speed optimisation", price: amount(addons[8].price) },
  { id: "gbp", label: "Google Business Profile", price: amount(addons[7].price) },
  { id: "care", label: "Basic maintenance", price: amount(maintenance[0].price) },
];

const state = { need: null, site: SITES[1].id, extras: new Set() };

// Which questions the visitor has answered themselves. Once a group is in
// here the suggested defaults never write to it again — see runDefaults().
const touched = new Set();
let defaultsRun = false;

const chip = (item, pressed, price) =>
  `<button class="chip" type="button" data-group="${item.group}" data-id="${item.id}" aria-pressed="${pressed}">${item.label}${
    price ? `<small>${rm(price)}</small>` : ""
  }</button>`;

const drawChips = () => {
  fill(
    "w-need",
    NEEDS.map((n) => chip({ ...n, group: "need" }, state.need === n.id, null)).join("")
  );
  fill(
    "w-site",
    SITES.map((s) => chip({ ...s, group: "site" }, state.site === s.id, s.price)).join("")
  );
  fill(
    "w-extra",
    EXTRAS.map((e) =>
      chip({ ...e, group: "extra" }, state.extras.has(e.id), e.price)
    ).join("")
  );
  const wantsSite = state.need && state.need !== "unsure";
  document.getElementById("w-site-wrap").hidden = !wantsSite;
  document.getElementById("w-extra-wrap").hidden = !wantsSite;
};

const lines = () => {
  const out = [];
  if (!state.need) return out;
  if (state.need === "unsure") return out;

  const site = SITES.find((s) => s.id === state.site);
  out.push({ label: `${site.label} website`, value: site.price });

  if (state.need === "site+infra" || state.need === "full") {
    out.push({ label: "Domain .com, first year", value: amount("RM59") });
    out.push({ label: "Starter hosting, one year", value: amount("RM500") });
  }
  if (state.need === "full") {
    out.push({ label: "Monthly SEO, starter", value: amount("RM800") });
  }
  EXTRAS.forEach((e) => {
    if (state.extras.has(e.id)) out.push({ label: e.label, value: e.price });
  });
  return out;
};

const drawReceipt = () => {
  const items = lines();
  const total = items.reduce((n, i) => n + (i.value || 0), 0);
  const list = document.getElementById("receipt-items");
  const empty = document.getElementById("receipt-empty");
  const totalEl = document.getElementById("receipt-total");

  list.innerHTML = items
    .map(
      (i) =>
        `<li><span>${i.label}</span><span>${
          i.value === null ? "quoted" : rm(i.value)
        }</span></li>`
    )
    .join("");
  empty.hidden = items.length > 0;

  // Say plainly when the figure is a suggestion rather than something the
  // visitor assembled. A pre-filled number must never read as their own.
  const hint = document.getElementById("receipt-hint");
  if (hint) hint.hidden = !(defaultsRun && touched.size === 0 && items.length > 0);

  if (totalEl.textContent !== rm(total)) {
    totalEl.textContent = rm(total);
    totalEl.classList.remove("bump");
    void totalEl.offsetWidth;
    totalEl.classList.add("bump");
  }
  const body = [
    "Hi HFZ, I built this estimate on your rate card:",
    "",
    ...items.map((i) => `• ${i.label} (${i.value === null ? "to quote" : rm(i.value)})`),
    "",
    `Estimated total: ${rm(total)}`,
    "",
    state.need === "unsure" ? "I am not sure yet, please advise." : "Please confirm scope and a start date.",
  ].join("\n");
  const href = `${waBase}?text=${encodeURIComponent(body)}`;
  document.getElementById("receipt-send").setAttribute("href", href);
};

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (btn) {
    const { group, id } = btn.dataset;
    // The guard. From here on this group belongs to the visitor and the
    // suggested defaults will not touch it, even mid-stagger.
    touched.add(group);
    if (group === "need") state.need = state.need === id ? null : id;
    if (group === "site") state.site = id;
    if (group === "extra") {
      state.extras.has(id) ? state.extras.delete(id) : state.extras.add(id);
    }
    drawChips();
    drawReceipt();
    return;
  }
  if (e.target.closest("#w-skip")) {
    // Chapter 07's contact block is the only place these details live now that
    // the footer is gone, so the skip button lands there and focuses the
    // WhatsApp pill rather than the receipt's own send button — the visitor
    // asked to skip building a quote.
    document.getElementById("ch-questions").scrollIntoView({ behavior: "smooth" });
    document.querySelector(".aside-wa").focus();
  }
});

drawChips();
drawReceipt();

/* ---------- suggested defaults ----------
   The builder used to open empty, which asked a visitor to answer three
   questions before it would tell them anything. It now opens with the answer
   most people would give: someone who agrees with all three can send it
   without touching a chip, and someone who disagrees only has to change the
   one thing they disagree with.

   The defaults land one at a time as the builder comes into view, which walks
   the eye through the three questions in order.

   `touched` is the guard, and the check runs at apply time rather than at
   schedule time — so a chip clicked halfway through the stagger still wins. */
const DEFAULTS = [
  { group: "need", id: "site+infra" },
  { group: "site", id: SITES[1].id },
  { group: "extra", id: "wa" },
];

const applyDefault = ({ group, id }) => {
  if (touched.has(group)) return;
  if (group === "need") {
    if (state.need === id) return;
    state.need = id;
  } else if (group === "site") {
    if (state.site === id) return;
    state.site = id;
  } else {
    if (state.extras.has(id)) return;
    state.extras.add(id);
  }
  drawChips();
  drawReceipt();
};

const runDefaults = () => {
  if (defaultsRun) return;
  defaultsRun = true;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    DEFAULTS.forEach(applyDefault);
    return;
  }
  DEFAULTS.forEach((d, i) => setTimeout(() => applyDefault(d), i * 240));
};

const wizard = document.querySelector(".wizard");

if (wizard) {
  /* Triggered by an explicit position check, same as chapter 02's cards.
     This used rootMargin "100% 0px -15% 0px", which fired when the builder's
     top reached 85% of the viewport — the moment it clipped the bottom edge.
     The visitor scrolled the builder properly into view to find the defaults
     had already landed and the receipt was already full.

     A plain comparison says what it means: the defaults land once the builder's
     top has risen past 55% of the viewport. Raise TRIGGER_AT to make it later.

     This also covers the two cases the full-viewport margin was there for,
     without special handling — a deep link or the skip link that opens the page
     below the builder leaves its top NEGATIVE, which is already past the line,
     so it fires on the first check. */
  const TRIGGER_AT = 0.55;

  const checkWizard = () => {
    if (wizard.getBoundingClientRect().top > window.innerHeight * TRIGGER_AT) return;
    runDefaults();
  };

  window.addEventListener("scroll", checkWizard, { passive: true });
  window.addEventListener("resize", checkWizard, { passive: true });
  checkWizard();
}

/* ---------- folio: which chapter am I in ---------- */

const links = [...document.querySelectorAll(".folio a")];
const folio = document.querySelector(".folio");
const sections = links
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && sections.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) =>
          a.classList.toggle(
            "is-active",
            a.getAttribute("href") === `#${entry.target.id}`
          )
        );
        // The folio is fixed, so it crosses both grounds. Its light ink
        // disappears over the paper chapters, so it flips to dark ink there.
        if (folio) {
          folio.classList.toggle(
            "on-paper",
            entry.target.classList.contains("paper")
          );
        }
      });
    },
    { rootMargin: "-45% 0px -45% 0px" }
  );
  sections.forEach((s) => io.observe(s));
}

import "./scene.js";

/* ---------- reveal ---------- */
/* Added from JS, never in the markup, so a failed script leaves every word
   visible instead of a page of invisible text. The class is applied by script
   and removed by the observer; nothing depends on scroll progress, which is what
   broke the previous version. */

const targets = document.querySelectorAll(
  ".floor dd, .chapter h2, .chapter-lead, .spread-main, .margin-note, .table-scroll, .ledger-rows, .tiers, .runs li, .faq details, .wizard-steps, .receipt"
);

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  targets.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
  });
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -6% 0px" }
  );
  targets.forEach((el) => io.observe(el));
}

/* ---------- chapter 02: the four fixes resolve as you reach them ----------
   Both miniatures in each card start out in the "before" state — dimmed, red
   rule, blurred, dead button. When the card comes into view the second one
   resolves: the dim lifts, the rule goes accent, the content sharpens, and a
   short burst fires out of it.

   The point is that the improvement is something the reader watches happen
   rather than reads about. Both halves of the comparison are true at the same
   moment, which is what makes the "after" land.

   `.pending` is added FROM JS, never in the markup, so a failed script leaves
   every card resolved rather than permanently dimmed. Same rule as .reveal. */
const flaws = [...document.querySelectorAll(".flaw")];
const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const burst = (host) => {
  for (let i = 0; i < 14; i += 1) {
    const s = document.createElement("i");
    s.className = "spark";
    const a = (i / 14) * Math.PI * 2 + Math.random() * 0.5;
    const d = 34 + Math.random() * 54;
    s.style.setProperty("--dx", `${(Math.cos(a) * d).toFixed(1)}px`);
    s.style.setProperty("--dy", `${(Math.sin(a) * d).toFixed(1)}px`);
    s.style.animationDelay = `${Math.round(Math.random() * 90)}ms`;
    host.appendChild(s);
    setTimeout(() => s.remove(), 1100);
  }
};

if (flaws.length) {
  if (noMotion || !("IntersectionObserver" in window)) {
    // no reveal to play: leave them resolved and skip the burst entirely
  } else {
    flaws.forEach((f) => f.classList.add("pending"));

    /* Triggered by an explicit position check rather than a rootMargin.
       A rootMargin of "0px 0px -18%" fired the moment a card clipped the
       bottom edge, so the whole 0.55s played out below the fold and the reader
       arrived to find it already finished. Pushing the rootMargin up to -52%
       then stopped it firing at all — a large negative percentage behaves
       unpredictably here, and it is not worth fighting.
       The check below is plain arithmetic and says exactly what it means: the
       card resolves once its top has risen past 55% of the viewport, i.e. once
       it is genuinely in view rather than just entering. Raise the threshold to
       make it later still. */
    const TRIGGER_AT = 0.55;

    const check = () => {
      const line = window.innerHeight * TRIGGER_AT;
      const due = flaws.filter(
        (card) =>
          card.classList.contains("pending") &&
          card.getBoundingClientRect().top <= line
      );

      due.forEach((card, i) => {
        /* The resolve has to happen SYNCHRONOUSLY, not inside a setTimeout.
           It used to be scheduled, which left the card carrying .pending
           through the delay — so every scroll event during that window
           re-queued the same card. The result was the burst firing over and
           over, and a queue counter that only ever grew, so the later cards
           waited longer and longer for their turn. Cards 1 and 2 looked fine
           and 3 and 4 arrived late with looping particles, which is exactly
           that bug.
           Removing the class here means the guard holds from this tick on. */
        card.classList.remove("pending");
        const good = card.querySelector(".win.good, .phone.good");
        // only the burst is staggered, so two cards crossing in the same tick
        // read as two events rather than one flash
        if (good) setTimeout(() => burst(good), i * 130);
      });
    };

    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    check();
  }
}
