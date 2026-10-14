import Title from "../components/Title";
import { fill, type OfferDict } from "../i18n";
import base from "../styles/base.module.css";
import s from "./Plan.module.css";

/** Month −9 … +1; the scale has ten month-long steps, opening at month 0. */
const FIRST = -9;
const LAST = 1;
const SPAN = LAST - FIRST;
const STAGES: ReadonlyArray<{ from: number; to: number; accent?: boolean }> = [
  { from: -9, to: -7 },
  { from: -8, to: -4 },
  { from: -6, to: -3 },
  { from: -3, to: 0, accent: true },
  { from: -0.6, to: 0 },
  { from: 0, to: 0.7 },
];

const at = (month: number) => ((month - FIRST) / SPAN) * 100;
/** −9 → "−9", 1 → "+1", with a real minus sign. */
const signed = (m: number) => (m > 0 ? `+${m}` : m < 0 ? `−${Math.abs(m)}` : "0");

export default function Plan({ plan }: { plan: OfferDict["plan"] }) {
  const ticks = Array.from({ length: SPAN + 1 }, (_, i) => FIRST + i);

  return (
    <section id="plan" className={base.section} aria-labelledby="plan-title">
      <div className={base.container}>
        <div className={base.head} data-reveal="">
          <p className={base.kicker}>{plan.kicker}</p>
          <h2 id="plan-title" className={base.h2}><Title text={plan.title} /></h2>
        </div>

        {/* Desktop: a Gantt chart. */}
        <div className={s.gantt} data-reveal="trigger" style={{ ["--open" as string]: at(0) / 100 }}>
          <div className={s.chart}>
          <div className={s.scaleRow} aria-hidden="true">
            <span />
            <div className={s.scale}>
              {ticks.map((m) => (
                <span key={m} className={`${s.tick} ${m === 0 ? s.tickOpen : ""}`} style={{ left: `${at(m)}%` }}>
                  {m === 0 ? plan.opening : signed(m)}
                </span>
              ))}
            </div>
          </div>
          <ol className={s.rows}>
            {plan.stages.map((name, i) => {
              const st = STAGES[i];
              return (
                <li key={name} className={s.row}>
                  <span className={s.name}>{name}</span>
                  <span className={s.track}>
                    <span
                      className={`${s.bar} ${st.accent ? s.barAccent : ""}`}
                      style={{ left: `${at(st.from)}%`, width: `${at(st.to) - at(st.from)}%`, ["--i" as string]: i }}
                    />
                    <span className={base.srOnly}>{fill(plan.range, { from: signed(st.from), to: signed(st.to) })}</span>
                  </span>
                </li>
              );
            })}
          </ol>
          <span className={s.openLine} aria-hidden="true" />
          </div>
          <p className={s.unit} aria-hidden="true">{plan.months}</p>
        </div>

        {/* Mobile: the same plan as a vertical timeline. */}
        <ol className={s.vertical} data-reveal="trigger">
          {plan.stages.map((name, i) => {
            const st = STAGES[i];
            return (
              <li key={name} className={`${s.vItem} ${st.accent ? s.vAccent : ""}`} style={{ ["--i" as string]: i }}>
                <span className={s.vRange}>{fill(plan.range, { from: signed(st.from), to: signed(st.to) })}</span>
                <span className={s.vName}>{name}</span>
              </li>
            );
          })}
          <li className={s.vOpening} style={{ ["--i" as string]: plan.stages.length }}>
            <span className={s.vRange}>0</span>
            <span className={s.vName}>{plan.opening}</span>
          </li>
        </ol>

        <p className={s.note} data-reveal="">{plan.note}</p>
      </div>
    </section>
  );
}
