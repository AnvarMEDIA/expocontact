import CountUp from "../components/CountUp";
import LogoMark from "../components/LogoMark";
import Parallax from "../components/Parallax";
import { IconArrow } from "../components/Icons";
import type { OfferDict } from "../i18n";
import base from "../styles/base.module.css";
import s from "./Hero.module.css";

interface HeroProps {
  hero: OfferDict["hero"];
  intl: string;
}

export default function Hero({ hero, intl }: HeroProps) {
  const n = (v: number) => new Intl.NumberFormat(intl).format(v);
  const stats = [
    { value: 2004, from: 1990, plain: true, display: "2004", suffix: "", label: hero.stats.since },
    { value: 5000, from: 0, plain: false, display: n(5000), suffix: "+", label: hero.stats.stands },
    { value: 500, from: 0, plain: false, display: n(500), suffix: "+", label: hero.stats.clients },
    { value: 24, from: 0, plain: true, display: "24", suffix: "/7", label: hero.stats.support },
  ];

  return (
    <section id="top" className={`${base.sectionDark} ${s.hero}`}>
      <Parallax className={s.markWrap}>
        <LogoMark className={s.mark} />
      </Parallax>
      <div className={s.glow} aria-hidden="true" />

      <div className={`${base.container} ${s.inner}`}>
        <p className={`${base.kicker} ${s.kicker}`}>{hero.kicker}</p>

        <h1 className={`${base.h1} ${s.title}`}>
          {hero.title.map((line, i) => (
            <span key={i} className={`${s.line} ${i > 0 ? base.accent : ""}`} style={{ ["--i" as string]: i }}>
              {line.replace(/ —/g, "\u00a0—")}
            </span>
          ))}
        </h1>

        <p className={`${base.lead} ${s.lead}`}>{hero.lead}</p>

        <div className={s.ctas} data-hero-ctas="">
          <a href="#contact" className={`${base.btn} ${base.btnPrimary}`} data-track="cta_hero">
            {hero.ctaPrimary}
            <IconArrow />
          </a>
          <a href="#visitors" className={`${base.btn} ${base.btnGhost}`} data-track="cta_hero_visitors">
            {hero.ctaSecondary}
          </a>
        </div>

        <ul className={s.stats}>
          {stats.map((stat) => (
            <li key={stat.label} className={s.stat}>
              <CountUp value={stat.value} from={stat.from} display={stat.display} plain={stat.plain}
                locale={intl} suffix={stat.suffix} className={s.statValue} />
              <span className={s.statLabel}>{stat.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
