import Title from "../components/Title";
import { IconArrow } from "../components/Icons";
import type { OfferDict } from "../i18n";
import base from "../styles/base.module.css";
import s from "./Problems.module.css";

export default function Problems({ problems }: { problems: OfferDict["problems"] }) {
  return (
    <section className={`${base.section} ${base.sectionGrey}`} aria-labelledby="problems-title">
      <div className={base.container}>
        <div className={base.head} data-reveal="">
          <p className={base.kicker}>{problems.kicker}</p>
          <h2 id="problems-title" className={base.h2}><Title text={problems.title} /></h2>
        </div>
        <ol className={s.list}>
          {problems.pairs.map((pair, i) => (
            <li key={pair.problem} className={s.row} data-reveal="" style={{ ["--d" as string]: i }}>
              <div className={s.problem}>
                <span className={s.label}>{problems.problemLabel}</span>
                <s className={s.struck}>{pair.problem}</s>
              </div>
              <span className={s.arrow} aria-hidden="true"><IconArrow /></span>
              <div className={s.solution}>
                <span className={s.label}>{problems.solutionLabel}</span>
                <p>{pair.solution}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
