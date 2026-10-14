import CountUp from "../components/CountUp";
import LogoMark from "../components/LogoMark";
import Marquee from "../components/Marquee";
import MotionToggle from "../components/MotionToggle";
import Title from "../components/Title";
import { PARTNERS, VENUES } from "../lib/content";
import type { OfferDict } from "../i18n";
import base from "../styles/base.module.css";
import s from "./Experience.module.css";

export default function Experience({ experience, a11y, intl }: {
  experience: OfferDict["experience"];
  a11y: OfferDict["a11y"];
  intl: string;
}) {
  const n = (v: number) => new Intl.NumberFormat(intl).format(v);
  const small = [
    { value: 500, display: n(500), suffix: "+", label: experience.clients },
    { value: 2000, display: n(2000), suffix: ` ${experience.sqm}`, label: experience.production },
    { value: 24, display: "24", suffix: "/7", label: experience.support, plain: true },
    { value: 7, display: "7", suffix: "", label: experience.venues, plain: true },
  ];

  return (
    <section id="experience" className={`${base.section} ${base.sectionDark}`} aria-labelledby="experience-title">
      <LogoMark animate={false} className={s.deco} />
      <div className={base.container}>
        <div className={base.head} data-reveal="">
          <p className={base.kicker}>{experience.kicker}</p>
          <h2 id="experience-title" className={base.h2}><Title text={experience.title} /></h2>
        </div>

        <div className={s.grid}>
          <div className={s.big} data-reveal="">
            <CountUp value={5000} display={n(5000)} suffix="+" locale={intl} className={s.bigValue} />
            <p className={s.bigText}>{experience.big}</p>
          </div>
          {small.map((tile, i) => (
            <div key={tile.label} className={s.tile} data-reveal="" style={{ ["--d" as string]: i + 1 }}>
              <CountUp value={tile.value} display={tile.display} suffix={tile.suffix} plain={tile.plain}
                locale={intl} className={s.tileValue} />
              <p className={s.tileText}>{tile.label}</p>
            </div>
          ))}
        </div>

        <MotionToggle className={s.rows} pauseLabel={a11y.pauseMotion} playLabel={a11y.playMotion}>
          <div data-reveal="">
            <p className={s.rowTitle}>{experience.venuesTitle}</p>
            <Marquee items={VENUES} label={experience.venuesTitle} />
          </div>
          <div data-reveal="">
            <p className={s.rowTitle}>{experience.partnersTitle}</p>
            <p className={s.partnersText}>{experience.partnersText}</p>
            <Marquee items={PARTNERS} label={experience.partnersTitle} reverse />
          </div>
        </MotionToggle>
      </div>
    </section>
  );
}
