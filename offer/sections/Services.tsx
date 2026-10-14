import Title from "../components/Title";
import { SERVICE_ICONS } from "../components/Icons";
import type { OfferDict } from "../i18n";
import base from "../styles/base.module.css";
import s from "./Services.module.css";

export default function Services({ services }: { services: OfferDict["services"] }) {
  return (
    <section id="services" className={base.section} aria-labelledby="services-title">
      <div className={base.container}>
        <div className={base.head} data-reveal="">
          <p className={base.kicker}>{services.kicker}</p>
          <h2 id="services-title" className={base.h2}><Title text={services.title} /></h2>
        </div>
        <ul className={s.grid}>
          {services.cards.map((card, i) => {
            const Icon = SERVICE_ICONS[i];
            const last = i === services.cards.length - 1;
            return (
              <li key={card.title} className={`${s.card} ${last ? s.cardAccent : ""}`}
                data-reveal="" style={{ ["--d" as string]: i }}>
                <span className={s.icon}><Icon /></span>
                <span className={s.num} aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <h3 className={s.title}>{card.title}</h3>
                <p className={s.text}>{card.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
