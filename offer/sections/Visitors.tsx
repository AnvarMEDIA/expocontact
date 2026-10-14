import Title from "../components/Title";
import type { OfferDict } from "../i18n";
import base from "../styles/base.module.css";
import s from "./Visitors.module.css";

export default function Visitors({ visitors }: { visitors: OfferDict["visitors"] }) {
  return (
    <section id="visitors" className={`${base.section} ${base.sectionDark}`} aria-labelledby="visitors-title">
      <div className={base.container}>
        <div className={base.head} data-reveal="">
          <p className={base.kicker}>{visitors.kicker}</p>
          <h2 id="visitors-title" className={base.h2}><Title text={visitors.title} /></h2>
        </div>

        {/* data-reveal="trigger": only marks the moment; the steps grow on their own. */}
        <ol className={s.steps} data-reveal="trigger">
          {visitors.steps.map((step, i) => (
            <li key={step.title} className={`${s.step} ${i === visitors.steps.length - 1 ? s.last : ""}`}
              style={{ ["--i" as string]: i }}>
              <span className={s.bar} aria-hidden="true" />
              <div className={s.content}>
                <span className={s.num}>{String(i + 1).padStart(2, "0")}</span>
                <h3 className={s.title}>{step.title}</h3>
                <p className={s.text}>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className={s.note} data-reveal="">{visitors.note}</p>
      </div>
    </section>
  );
}
