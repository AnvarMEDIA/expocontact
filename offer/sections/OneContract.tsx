"use client";

/**
 * «Один договор вместо пяти». Five scattered contractors, tangled together by
 * dashed lines; as the section scrolls up, the lines let go and the five
 * blocks fly into the ExpoContact card and disappear inside it.
 *
 * Scroll-linked through framer-motion's useScroll. Progress is written to CSS
 * custom properties on the stage, and CSS turns them into transform and
 * opacity — React does not re-render while scrolling. Offsets from each block
 * to the card are measured once per resize. Under prefers-reduced-motion the
 * scene stays in its first state: both sides fully visible, nothing moves.
 */
import { useEffect, useRef } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
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

export default function OneContract({ contract }: { contract: OfferDict["contract"] }) {
  const stage = useRef<HTMLDivElement>(null);
  const cloud = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLSpanElement>(null);
  const chips = useRef<(HTMLLIElement | null)[]>([]);
  const reduce = useRef(false);

  // Driven by the cloud of blocks, not the whole stage: on a phone the stage
  // is taller than the screen, and timing it by the stage finished the scene
  // before the blocks were even in view. Starts when the cloud's centre is at
  // 70% of the viewport, ends at 25% — by then the card is on screen too.
  const { scrollYProgress } = useScroll({ target: cloud, offset: ["center 0.7", "center 0.25"] });

  const apply = (p: number) => {
    const el = stage.current;
    if (!el || reduce.current) return;
    el.style.setProperty("--c", ease(clamp(p / 0.8)).toFixed(4));      // blocks converge
    el.style.setProperty("--f", clamp((p - 0.55) / 0.35).toFixed(4));   // blocks fade into the card
    el.style.setProperty("--l", clamp(p / 0.5).toFixed(4));             // lines let go
    el.style.setProperty("--k", clamp((p - 0.6) / 0.4).toFixed(4));     // the card lights up
  };

  useMotionValueEvent(scrollYProgress, "change", apply);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce.current) return;

    // Offsets are taken from the untransformed layout: the cloud and the
    // badge never move, each block is centred on its spot.
    const measure = () => {
      const box = cloud.current?.getBoundingClientRect();
      const target = badge.current?.getBoundingClientRect();
      if (!box || !target) return;
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
      apply(scrollYProgress.get());
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (stage.current) ro.observe(stage.current);
    return () => ro.disconnect();
    // apply and scrollYProgress are stable for the life of the component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className={base.section} aria-labelledby="contract-title">
      <div className={base.container}>
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

          <div className={s.with}>
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
      </div>
    </section>
  );
}
