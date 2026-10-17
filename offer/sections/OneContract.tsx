"use client";

/**
 * «Один договор вместо пяти». Five scattered contractors, tangled together by
 * dashed lines; as the visitor scrolls, the lines let go first, then the five
 * blocks fly into the ExpoContact card and disappear inside it.
 *
 * The scene has to be seen to make its point, so on a screen tall enough it
 * is pinned: the heading and the stage stay put while the visitor scrolls
 * through ~80vh, and that scroll drives the scene. Before the pin starts and
 * after it ends nothing moves. Pinned unpinned, the scene played out in three
 * wheel clicks — the stage was fully on screen only after the blocks had
 * already left, and visitors saw the block «just disappear».
 *
 * - Whole block (heading + stage) pinned when it fits under the header;
 *   otherwise the stage alone; on phones (stacked, taller than the screen)
 *   nothing is pinned and the scene is timed by the ExpoContact card coming
 *   up from below, so the blocks and their destination are both in view.
 * - Progress is written to CSS custom properties on the stage and CSS turns
 *   it into transform and opacity: no React render while scrolling.
 * - Pinning is switched on from JavaScript (data-pin), so without scripts,
 *   or under prefers-reduced-motion, the section is a plain static block in
 *   its first state with both sides fully visible.
 */
import { useEffect, useRef } from "react";
import Title from "../components/Title";
import LogoMark from "../components/LogoMark";
import { IconArrow, IconCheck } from "../components/Icons";
import type { OfferDict } from "../i18n";
import base from "../styles/base.module.css";
import s from "./OneContract.module.css";

/** Where the five blocks sit in the cloud, in % of its box, and their tilt. */
const SPOTS = [
  { x: 24, y: 18, r: -7 },
  { x: 72, y: 15, r: 5 },
  { x: 48, y: 48, r: -3 },
  { x: 76, y: 74, r: 8 },
  { x: 26, y: 80, r: 4 },
] as const;

/** Which blocks the dashed lines tie together — crossing on purpose. */
const TIES = [[0, 3], [1, 4], [2, 0], [3, 1], [4, 2], [0, 1]] as const;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/** Breathing room under the fixed header, in rem: it scales with the page. */
const GAP_REM = 1;
/** Scroll distance the pinned scene plays over, as a share of the viewport. */
const TRAVEL = 0.8;

type PinMode = "block" | "stage" | "none";

export default function OneContract({ contract }: { contract: OfferDict["contract"] }) {
  const track = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cloud = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLSpanElement>(null);
  const spacerBlock = useRef<HTMLDivElement>(null);
  const spacerStage = useRef<HTMLDivElement>(null);
  const chips = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wide = window.matchMedia("(min-width: 900px)");
    let mode: PinMode = "none";
    let pinTop = 0;
    let travel = 0;
    let frame = 0;

    // Scene timeline: the lines let go first, then the blocks fly, fade into
    // the card, and the card lights up as the last one lands.
    const apply = (q: number) => {
      const el = stage.current;
      if (!el) return;
      el.style.setProperty("--l", clamp(q / 0.35).toFixed(4));
      el.style.setProperty("--c", ease(clamp((q - 0.15) / 0.65)).toFixed(4));
      el.style.setProperty("--f", clamp((q - 0.6) / 0.25).toFixed(4));
      el.style.setProperty("--k", clamp((q - 0.7) / 0.3).toFixed(4));
    };

    const progress = () => {
      const vh = window.innerHeight;
      if (mode !== "none") {
        // The spacer sits right after the pinned element in the flow, so its
        // top tells where that element would be if it were not stuck.
        const spacer = (mode === "block" ? spacerBlock : spacerStage).current;
        const stuck = (mode === "block" ? pin : stage).current;
        if (!spacer || !stuck || travel <= 0) return 0;
        const natural = spacer.getBoundingClientRect().top - stuck.offsetHeight;
        const p = (pinTop - natural) / travel;
        // A short hold before the first move and after the last one.
        return clamp((p - 0.08) / 0.8);
      }
      // Not pinned: from the card's top edge a little above the bottom of the
      // screen (the cloud is then fully in view) to the card's centre
      // reaching the middle.
      const box = card.current?.getBoundingClientRect();
      if (!box) return 0;
      const start = vh * 0.9;
      const end = vh / 2 - box.height / 2;
      return clamp((start - box.top) / (start - end));
    };

    const update = () => {
      frame = 0;
      apply(progress());
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const measure = () => {
      const vh = window.innerHeight;
      // The header and the gap scale with the root font size on big screens.
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const header = document.querySelector("header")?.offsetHeight ?? 72;
      const gap = GAP_REM * rem;
      const room = vh - header - gap * 2;
      // Without the stage spacer, which is inside the block when shown.
      const blockH = (pin.current?.offsetHeight ?? 0) - (spacerStage.current?.offsetHeight ?? 0);
      const stageH = stage.current?.offsetHeight ?? 0;
      mode = !wide.matches ? "none" : blockH <= room ? "block" : stageH <= room ? "stage" : "none";
      const pinnedH = mode === "block" ? blockH : stageH;
      // Centred in the space under the header.
      pinTop = Math.round(header + gap + Math.max(0, (room - pinnedH) / 2));
      travel = Math.round(vh * TRAVEL);
      const tr = track.current;
      if (tr) {
        if (mode === "none") delete tr.dataset.pin;
        else tr.dataset.pin = mode;
        tr.style.setProperty("--pin-top", `${pinTop}px`);
        tr.style.setProperty("--travel", `${travel}px`);
      }

      // Offsets from each block to the badge, taken from the untransformed
      // layout: the cloud and the badge never move, each block is centred on
      // its spot.
      const box = cloud.current?.getBoundingClientRect();
      const target = badge.current?.getBoundingClientRect();
      if (box && target) {
        const tx = target.left + target.width / 2;
        const ty = target.top + target.height / 2;
        SPOTS.forEach((spot, i) => {
          const chip = chips.current[i];
          if (!chip) return;
          const cx = box.left + (box.width * spot.x) / 100;
          const cy = box.top + (box.height * spot.y) / 100;
          chip.style.setProperty("--dx", `${(tx - cx).toFixed(1)}px`);
          chip.style.setProperty("--dy", `${(ty - cy).toFixed(1)}px`);
        });
      }
      update();
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (stage.current) ro.observe(stage.current);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    wide.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      wide.removeEventListener("change", measure);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className={base.section} aria-labelledby="contract-title">
      <div ref={track} className={s.track}>
        <div ref={pin} className={`${base.container} ${s.pin}`}>
          <div className={base.head} data-reveal="">
            <p className={base.kicker}>{contract.kicker}</p>
            <h2 id="contract-title" className={base.h2}><Title text={contract.title} /></h2>
          </div>

          <div ref={stage} className={s.stage}>
            <div className={s.usual}>
              <p className={s.panelLabel}>{contract.usualLabel}</p>
              <div ref={cloud} className={s.cloud}>
                <svg className={s.lines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  {TIES.map(([a, b], i) => {
                    const p = SPOTS[a];
                    const q = SPOTS[b];
                    const mx = (p.x + q.x) / 2 + (i % 2 ? 14 : -14);
                    const my = (p.y + q.y) / 2 + (i % 3 ? -10 : 12);
                    return <path key={i} d={`M${p.x} ${p.y} Q${mx} ${my} ${q.x} ${q.y}`} vectorEffect="non-scaling-stroke" />;
                  })}
                </svg>
                {/* Where the blocks were: dashed outlines that show once they leave. */}
              <ul className={s.ghosts} aria-hidden="true">
                {contract.usual.map((item, i) => (
                  <li key={item} className={s.ghost}
                    style={{ left: `${SPOTS[i].x}%`, top: `${SPOTS[i].y}%`, ["--r" as string]: `${SPOTS[i].r}deg` }}>
                    <span className={s.dot} />
                    {item}
                  </li>
                ))}
              </ul>
              <ul className={s.chips}>
                  {contract.usual.map((item, i) => (
                    <li key={item} ref={(el) => { chips.current[i] = el; }} className={s.chip}
                      style={{ left: `${SPOTS[i].x}%`, top: `${SPOTS[i].y}%`, ["--r" as string]: `${SPOTS[i].r}deg` }}>
                      <span className={s.dot} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <p className={s.caption}>
                <span className={s.captionText}>{contract.usualCaption}</span>
                <span className={s.strike} aria-hidden="true" />
              </p>
            </div>

            <span className={s.arrow} aria-hidden="true"><IconArrow /></span>

            <div ref={card} className={s.with}>
              <div className={s.glow} aria-hidden="true" />
              <div className={s.withHead}>
                <span ref={badge} className={s.badge}><LogoMark animate={false} className={s.badgeMark} /></span>
                <p className={s.withLabel}>{contract.withLabel}</p>
              </div>
              <ul className={s.withList}>
                {contract.with.map((item) => (
                  <li key={item}>
                    <span className={s.check} aria-hidden="true"><IconCheck /></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Scroll room for the pinned scene: one or the other is shown, see data-pin. */}
          <div ref={spacerStage} className={s.spacerStage} aria-hidden="true" />
        </div>
        <div ref={spacerBlock} className={s.spacerBlock} aria-hidden="true" />
      </div>
    </section>
  );
}
