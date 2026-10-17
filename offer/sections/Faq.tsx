/**
 * Questions organisers ask, answered from what the rest of the page already
 * says — the plan's months, the venues, the formats, how visitors are brought
 * and what the report holds. Nothing here is a new promise.
 *
 * Native <details>: every answer is in the HTML, so search engines and AI
 * assistants read it without opening anything, and the same text feeds the
 * FAQPage structured data in the layout (no cloaking — see CLAUDE.md). The
 * first answer starts open.
 */
import Title from "../components/Title";
import type { OfferDict } from "../i18n";
import base from "../styles/base.module.css";
import s from "./Faq.module.css";

export default function Faq({ faq }: { faq: OfferDict["faq"] }) {
  return (
    <section id="faq" className={`${base.section} ${base.sectionGrey}`} aria-labelledby="faq-title">
      <div className={`${base.container} ${s.layout}`}>
        <div className={base.head} data-reveal="">
          <p className={base.kicker}>{faq.kicker}</p>
          <h2 id="faq-title" className={base.h2}><Title text={faq.title} /></h2>
        </div>
        <div className={s.list}>
          {faq.items.map((item, i) => (
            <details key={item.q} className={s.item} open={i === 0} data-reveal="" style={{ ["--d" as string]: i }}>
              <summary className={s.question}>
                <span>{item.q}</span>
                <span className={s.icon} aria-hidden="true" />
              </summary>
              <p className={s.answer}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
