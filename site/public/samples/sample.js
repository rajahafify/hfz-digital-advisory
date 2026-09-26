/* Shared behaviour for the sample sites.
   Each one is a real page: sections reveal as they scroll in, and the page
   publishes its own scroll progress as --mp so the parallax layers can move
   against it. Nothing here depends on the hero that displays it. */
(() => {
  const root = document.documentElement;

  const publish = () => {
    const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const p = Math.min(1, Math.max(0, window.scrollY / max));
    root.style.setProperty("--mp", p.toFixed(4));
  };

  window.addEventListener("scroll", publish, { passive: true });
  window.addEventListener("resize", publish);
  publish();

  // reveal on scroll, the way a real site does it
  const sel = [
    ".f-card",
    ".f-tile",
    ".f-trust div",
    ".m-card",
    ".m-review-row blockquote",
    ".m-badges div",
    ".m-proof h5",
    ".m-social h5",
    ".r-claims > div",
    ".r-deptgrid span",
    ".r-guidegrid a",
    ".r-chapter h5",
    ".v-card",
    ".v-featuregrid > div",
    ".v-steps div",
    ".v-coach",
    ".v-countryrow div",
  ].join(",");

  const items = [...document.querySelectorAll(sel)];
  if (!items.length) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("rv", "in"));
    return;
  }

  items.forEach((el) => {
    el.classList.add("rv");
    const sibs = el.parentElement ? [...el.parentElement.children] : [el];
    const i = sibs.indexOf(el);
    if (i > 0) el.style.transitionDelay = `${Math.min(i, 5) * 90}ms`;
  });


  // cards tilt toward the cursor, and the shadow realigns underneath them
  const tilts = [...document.querySelectorAll("[data-tilt]")];
  if (tilts.length && window.matchMedia("(pointer: fine)").matches && !reduced) {
    tilts.forEach((el) => {
      const max = Number(el.dataset.tilt) || 10;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          "perspective(900px) rotateY(" + (x * max).toFixed(2) + "deg) rotateX(" + (-y * max).toFixed(2) + "deg) translateZ(22px)";
        el.style.setProperty("--sh", (x * -26).toFixed(1) + "px " + (y * -22 + 26).toFixed(1) + "px 52px -18px rgba(22,21,15,0.42)");
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
        el.style.removeProperty("--sh");
      });
    });
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px" }
  );
  items.forEach((el) => io.observe(el));
})();
