/* ---------- hero scene: one site at a time, in focus ---------- */
/* CSS3DRenderer, not a texture. The panels are real markup authored at 1440x900
   and scaled down, so type stays selectable and sharp.

   The cycle, per panel: arrives small and far, grows to full size, holds while
   its own micro-animation plays, then recedes small again as the next one
   arrives. Everything not in focus is blurred hard and fast, so the copy in
   front of it is never fighting a moving picture. */

(async () => {
  const host = document.getElementById("scene");
  const source = document.getElementById("scene-source");
  if (!host || !source) return;
  if (window.matchMedia("(max-width: 900px)").matches) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // three is ~187 kB gzipped. Wait for idle so it never competes with first
  // paint, and only desktop ever fetches it at all.
  await new Promise((res) => {
    if (window.requestIdleCallback) window.requestIdleCallback(res, { timeout: 1500 });
    else setTimeout(res, 300);
  });

  let three, css3d;
  try {
    [three, css3d] = await Promise.all([
      import("three"),
      import("three/examples/jsm/renderers/CSS3DRenderer.js"),
    ]);
  } catch {
    return;
  }

  const { Scene, PerspectiveCamera, Group } = three;
  const { CSS3DRenderer, CSS3DObject } = css3d;

  const renderer = new CSS3DRenderer();
  renderer.setSize(host.clientWidth, host.clientHeight);
  host.appendChild(renderer.domElement);

  const scene = new Scene();
  const FOV = 38;
  const CAM_Z = 1000;
  const STAGE_Z = 180; // the live panel's z, used to size the visible area
  const camera = new PerspectiveCamera(FOV, host.clientWidth / host.clientHeight, 1, 9000);
  camera.position.set(0, 0, CAM_Z);

  /* The stage sits right of centre so the live site never crosses the headline.
     A fixed world x does not work for that: the camera has a fixed fov, so a
     narrower viewport sees a narrower slice of the world, and the same x walks
     off the right edge. At 1080 the panel was down to a sliver.

     The position is now derived from the CONTENT COLUMN, not from the viewport.
     Five earlier attempts all positioned the panel relative to the window — a
     fraction of the half-width, tuned by eye at 0.44 then 0.38 — and the result
     was that the panel had no relationship to the page's own grid: it overflowed
     the .wrap column on a wide screen and fell short of it on a narrow one.
     The client marked both failures with the column's edges drawn on.

     So the panel's RIGHT EDGE is aligned to the content column's right edge.
     The column is .wrap: max-width 1240 with 32px of padding, centred, so its
     right edge sits (1240 / 2) - 32 = 588px from the viewport centre, or
     viewportWidth / 2 - 32 once the window is narrower than the wrap.
     Everything else — the panel's projected width — is subtracted from that.

     The camera must look straight ahead for any of this to hold; see the
     lookAt note in the render loop. */
  const CONTENT_RIGHT = 588; // (1240 / 2) - 32, from .wrap's max-width and padding
  const PANEL_YAW = 0.95; // must match LIVE.ry below
  /* The panel's on-screen footprint is much wider than W * cos(yaw) suggests,
     because a Y-rotated panel's bounding box grows with its HEIGHT as well:
     the top and bottom edges slope, so the corners swing out sideways. Measured
     against the live page, the real footprint is ~1.9x the naive cos estimate.
     This factor is empirical — if the panel ever starts crossing the column
     edge again, re-measure rather than re-derive. */
  const PANEL_SPREAD = 1.9;

  const stageX = () => {
    const half = (CAM_Z - STAGE_Z) * Math.tan((FOV / 2) * (Math.PI / 180));
    const halfW = half * (host.clientWidth / host.clientHeight);
    const toScreen = host.clientWidth / (2 * halfW);
    const columnRight = Math.min(CONTENT_RIGHT, host.clientWidth / 2 - 32);
    const panelHalf =
      (PANEL_W * Math.cos(PANEL_YAW) * PANEL_SPREAD * stageScale() * toScreen) / 2;
    return (columnRight - panelHalf) / toScreen;
  };

  /* The panel is a fixed world size (300x533, see .panel), and a perspective
     camera makes that wrong at every viewport that is not the one it was tuned
     on. Three attempts got here:
       1. fixed world size  -> the panel grew as a share of the screen as the
          viewport narrowed. ~49% at 1080.
       2. constant FRACTION -> fixed at 30% everywhere, which made it 614px wide
          on a 1920 screen and 345px on a 1080 one. The client's words: "too big
          in widescreen while tiny in smaller viewport".
       3. constant pixel WIDTH -> correct in principle, but width is the wrong
          thing to pin for a PORTRAIT panel. At 300px wide it was 533 tall,
          which left a void to its right and read as too small at both sizes.
     Size is now pinned by HEIGHT as a fraction of the viewport, which is what a
     portrait panel actually needs: it fills the hero's height at every viewport
     and the width follows from the aspect.
     screenPx = worldSize / (2 * half) * viewportHeight, so solving for the scale
     that lands TARGET_H * viewportHeight on screen reduces to this. */
  const PANEL_W = 300; // must match .panel's width in styles.css
  const PANEL_H = 533; // must match .panel's height
  const TARGET_H = 0.7;
  const stageScale = () => {
    const half = (CAM_Z - STAGE_Z) * Math.tan((FOV / 2) * (Math.PI / 180));
    return (TARGET_H * 2 * half) / PANEL_H;
  };

  const group = new Group();
  group.position.x = stageX();
  scene.add(group);

  const objects = [...source.querySelectorAll(".panel")].map((el) => {
    const o = new CSS3DObject(el);
    group.add(o);
    return o;
  });
  const n = objects.length;

  // Each panel frames a real standalone page in a same-origin iframe, so the
  // hero drives that page's own scroll. Nothing loads until the panel is about
  // to come on stage, and the framed page publishes its own --mp from the real
  // scroll position, which is what makes its parallax genuine.
  const frames = objects.map((o) => ({
    iframe: o.element.querySelector("iframe"),
    panel: o.element,
  }));
  const loaded = new Set();

  const ensureLoaded = (i) => {
    if (i < 0 || loaded.has(i)) return;
    const f = frames[i];
    if (!f || !f.iframe) return;
    loaded.add(i);
    f.iframe.addEventListener(
      "load",
      () => {
        f.panel.classList.add("ready");
        // The frame starts as about:blank, so any blur written before it loads
        // landed on a document that no longer exists. Forget the cached value
        // so the next frame of the loop reapplies it to the real document.
        lastBlur.delete(i);
      },
      { once: true }
    );
    f.iframe.src = f.iframe.dataset.src;
  };

  // A framed page is only ever shown a short, slow scroll: one comfortable
  // stretch of the page, not the whole document. Scrolling the full height in
  // a couple of seconds is a blur, not a look at the site.
  const TRAVEL = 640; // px of the framed page shown while it is on stage

  const lastY = new Map();
  const lastBlur = new Map();

  // The softness is applied INSIDE the framed document, on its own root
  // element, not on the panel that contains the iframe. A filter on an ancestor
  // of a scrolling iframe is what caused the white gaps: Chromium puts the
  // frame in a filtered layer and then fails to repaint the tiles it exposes.
  // Within the frame's own document there is no cross-document compositing to
  // break, so this is the same look with none of the bug.
  const soften = (i, b) => {
    const f = frames[i];
    if (!f || !f.iframe) return;
    let doc;
    try {
      doc = f.iframe.contentDocument;
    } catch {
      return;
    }
    if (!doc || !doc.documentElement) return;
    const soft = b > 0.15;
    const v = soft ? `${b.toFixed(2)}px` : "0px";
    if (lastBlur.get(i) === v) return;
    lastBlur.set(i, v);
    doc.documentElement.style.setProperty("--blur", v);
    doc.documentElement.classList.toggle("is-soft", soft);
  };

  const drive = (i, p) => {
    const f = frames[i];
    if (!f || !f.iframe) return;
    let doc;
    try {
      doc = f.iframe.contentDocument;
    } catch {
      return; // cross-origin, which it never should be
    }
    if (!doc || !doc.body) return;
    const max = Math.max(0, doc.body.scrollHeight - 900);
    const y = Math.round(Math.min(max, p * TRAVEL));
    // Only touch the frame when the value actually moves. Writing scrollTop
    // every frame on every frame is wasted work.
    if (lastY.get(i) === y) return;
    lastY.set(i, y);
    if (f.iframe.contentWindow) f.iframe.contentWindow.scrollTo(0, y);
  };

  // One panel occupies the stage. Everything else is parked off to the left,
  // hidden. The exchange overlaps: while one reverses out, the next swipes in.
  // Everything moves right to left: a site enters from stage right, holds
  // centre, then exits to stage left, which is also where the parked panels
  // sit. One direction, so the exchange reads as a conveyor rather than as two
  // panels swapping places.
  const SWIPE = { x: 760, z: -150, s: 0.94, ry: -1.25, op: 0, blur: 9 };
  // The panel on stage is NOT blurred, deliberately.
  //
  // A CSS filter on an ancestor of an iframe pushes the frame into a filtered
  // compositing layer, and while that frame scrolls Chromium fails to repaint
  // the newly exposed tiles: you get white gaps where content should be. It
  // shows up on the pages that actually scroll photography (Rakan, Vita) and
  // not on the flat ones, which is what made it look like a per-site bug.
  //
  // The muting is done with a scrim instead (see .panel-scrim in styles.css),
  // which costs nothing to composite and cannot desync from the frame.
  // The panel on stage keeps a light blur. At 0.3 scale its text is legible
  // enough to compete with the headline in front of it, which inverts the
  // hierarchy: the scene is the backdrop, the copy is the message.
  const LIVE_BLUR = 3; // px. The single dial for how present the scene is.
  /* ry is POSITIVE in every state. Measured on the built page, a negative ry
     renders with the LEFT edge taller — the trapezoid narrows to the right,
     which is what read as the panel crowding the headline. Positive ry puts the
     right edge nearer, so the trapezoid points left and the panel leans away
     from the copy.
     The old values disagreed with each other: negative while entering, positive
     while leaving, so the lean flipped direction halfway through every cycle.
     Keep the sign consistent or the panel appears to twist mid-flight.
     LIVE is no longer 0 — the panel holds a resting angle, so the trapezoid is
     always present instead of only appearing during the exchange. */
  const LIVE = { x: 0, z: 180, s: 1, ry: -0.95, op: 1, blur: LIVE_BLUR };
  const BACK = { x: -430, z: -820, s: 0.6, ry: -1.15, op: 0, blur: 13 };
  const PARK = { x: -980, z: -900, s: 0.56, ry: -1.2, op: 0, blur: 13 };

  // the cycle is a continuous timeline, so an exit and the next entry share
  // the same window instead of running one after the other
  const ENTER = 0.19; // x from -ENTER to 0 is the swipe in
  const LEAVE = 0.19; // x from 1-LEAVE to 1 is the reverse out
  // 3800 x (1 - LEAVE) = ~3.1s of scrolling while a panel is on stage
  const CYCLE = 3800; // ms per panel

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = (v) => Math.min(1, Math.max(0, v));

  /* Two easing curves, and that is deliberate.
     There used to be a "juice kit" here — easeOutBack, easeInBack, a damped
     settle() oscillation, an overshoot envelope and a per-cycle random seed —
     on the game-feel theory that overshoot reads as weight. On a panel this
     large it read as a boat on open water instead: the client's words were
     "unstable like im at the open seas". Entry and exit now use one plain cubic
     each, and the hold is completely static.
     Do not reintroduce overshoot without watching it at full size. */
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeInCubic = (t) => t * t * t;

  let t0 = performance.now();
  let liveEl = null;
  let px = 0;
  let py = 0;
  let camX = 0;
  let scrollP = 0;

  // The rail names whichever site is on stage. It is not a link: the panels are
  // an illustration of what we build, not a portfolio to send people away for.
  const nowShowing = document.getElementById("nowshowing");

  const setLive = (el) => {
    if (liveEl === el) return;
    if (liveEl) liveEl.classList.remove("is-live");
    liveEl = el;
    if (el) el.classList.add("is-live");
    if (el && nowShowing) {
      const name = el.querySelector(".poster b");
      nowShowing.textContent = name ? name.textContent : el.dataset.site;
    }
  };

  // Nothing is ever filtered on the panel itself. The softness lives inside the
  // frame (see soften), and the dimming is left to opacity.
  const place = (o, i, st) => {
    o.position.set(st.x, st.y || 0, st.z);
    // stageScale() holds the panel at a constant share of the viewport; st.s
    // keeps the relative sizes of the states (enter 0.94, back 0.6, park 0.56).
    const k = st.s * stageScale();
    o.scale.set(k, k, 1);
    o.element.style.opacity = st.op.toFixed(3);
    soften(i, st.blur);
  };


  const paint = (now) => {

    // continuous stage time, wrapped over the panel count. Each panel gets a
    // local x of [-ENTER, 1]: negative is its swipe in, past 1-LEAVE is its
    // reverse out. Two panels therefore overlap in the exchange window.
    const s = ((now - t0) / CYCLE) % n;

    let liveIndex = -1;

    objects.forEach((o, i) => {
      const x = (((s - i + ENTER) % n) + n) % n - ENTER;
      let st;

      if (x < -ENTER || x > 1) {
        st = { ...PARK, x: PARK.x - (((i * 137) % 400) + 0) };
      } else if (x < 0) {
        /* ENTERING. Position, scale and yaw all ease with the same plain cubic.
           This used to overshoot — the panel grew past its resting size, surged
           forward in z and unwound its yaw with easeOutBack, with the amount
           varying per cycle. It read as a bounce, and on a panel this large a
           bounce is not "weight", it is seasickness. One curve, no overshoot. */
        const u = clamp01((x + ENTER) / ENTER);
        st = {
          x: lerp(SWIPE.x, LIVE.x, easeOutCubic(u)),
          y: 0,
          z: lerp(SWIPE.z, LIVE.z, easeOutCubic(u)),
          s: lerp(SWIPE.s, LIVE.s, easeOutCubic(u)),
          ry: lerp(SWIPE.ry, LIVE.ry, easeOutCubic(u)),
          op: clamp01(u * 1.7),
          blur: lerp(SWIPE.blur, LIVE.blur, easeOutCubic(u)),
        };
      } else if (x > 1 - LEAVE) {
        /* LEAVING. Plain cubic, same as the entry. This used to wind up first —
           easeInBack pulled it the opposite way before it went — which read as
           the panel being yanked about rather than leaving. */
        const v = clamp01((x - (1 - LEAVE)) / LEAVE);
        st = {
          x: lerp(LIVE.x, BACK.x, easeInCubic(v)),
          y: 0,
          z: lerp(LIVE.z, BACK.z, easeInCubic(v)),
          s: lerp(LIVE.s, BACK.s, easeInCubic(v)),
          ry: lerp(LIVE.ry, BACK.ry, easeInCubic(v)),
          op: clamp01(1 - v * 1.4),
          blur: lerp(LIVE.blur, BACK.blur, easeInCubic(v)),
        };
      } else {
        /* HOLDING. Absolutely still.
           This used to run a damped oscillation on z, scale and yaw plus a
           vertical bob for the first third of the hold, with the amplitude
           varying per cycle. On a small panel that reads as landing with
           weight; on one this size it reads as a boat. Nothing moves here now:
           the panel arrives, stops, and holds until it leaves. */
        st = { ...LIVE };
        liveIndex = i;
      }

      place(o, i, st);
      o.rotation.y = st.ry || 0;
    });

    setLive(liveIndex >= 0 ? objects[liveIndex].element : null);

    // The framed page scrolls itself while it is on stage, so its parallax and
    // reveals run off real scroll rather than a keyframe. Every other panel is
    // held at the top: a panel that is not live is still visible while it
    // swipes in, and if it kept the position it ended on last cycle the
    // visitor would see the bottom of the page before it jumped to the top.
    if (liveIndex >= 0) ensureLoaded((liveIndex + 1) % n);
    objects.forEach((o, i) => {
      if (i === liveIndex) ensureLoaded(i);
      const p = i === liveIndex ? clamp01((s - i) / (1 - LEAVE)) : 0;
      drive(i, p);
    });

    /* Pointer parallax, kept deliberately small.
       This was 130 / 50 / 90, which is a camera yaw of about 7.4 degrees at
       full deflection — enough that moving the mouse swung the whole scene and
       read as the page pitching. Roughly a third of that now, and damped a
       little faster so it settles instead of trailing. It is still here because
       a hero that does not respond to the pointer at all feels dead; if it
       still reads as swaying, set PARALLAX to 0 and the scene becomes static. */
    const PARALLAX = { x: 44, y: 18, z: 40, ease: 0.08 };
    camX += (px * PARALLAX.x - camX) * PARALLAX.ease;
    camera.position.set(camX, -py * PARALLAX.y, 1000 - scrollP * PARALLAX.z);
    /* Aim straight ahead, NOT at the stage.
       This used to be lookAt(group.position.x * 0.55), which yawed the camera
       toward the panel. A yawed camera views the panel off-axis, and an
       off-axis flat plane projects as a trapezoid — so the camera was
       contributing a slope of its own, on top of the panel's ry, and its size
       changed with the viewport because group.x is aspect-dependent. At some
       widths the two cancelled and at others they compounded, which is why the
       slope looked like it flipped depending on window size.
       Aiming at the origin leaves ry as the only thing that can tilt the panel. */
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  };

  const readScroll = () => {
    scrollP = clamp01(window.scrollY / (window.innerHeight * 1.1));
  };

  const frame = (now) => {
    const r = host.getBoundingClientRect();
    if (r.bottom > -200) paint(now || performance.now());
    requestAnimationFrame(frame);
  };

  window.addEventListener("scroll", readScroll, { passive: true });
  host.addEventListener("pointermove", (e) => {
    const r = host.getBoundingClientRect();
    px = ((e.clientX - r.left) / r.width - 0.5) * 2;
    py = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });
  host.addEventListener("pointerleave", () => {
    px = 0;
    py = 0;
  });
  window.addEventListener("resize", () => {
    renderer.setSize(host.clientWidth, host.clientHeight);
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.updateProjectionMatrix();
    // the stage is positioned as a fraction of the visible width, so it has to
    // be recomputed or the panel drifts off screen as the viewport narrows
    group.position.x = stageX();
  });

  if (reduced) {
    setLive(objects[0].element);
    place(objects[0], 0, LIVE);
    objects.slice(1).forEach((o, i) => place(o, i + 1, { ...PARK, x: PARK.x - i * 137 }));
    ensureLoaded(0);
    renderer.render(scene, camera);
    host.classList.add("ready");
    return;
  }

  readScroll();
  paint(performance.now());
  host.classList.add("ready");
  requestAnimationFrame(frame);
})();
