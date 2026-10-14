import CountUp from "../components/CountUp";
import Title from "../components/Title";
import { fill, type OfferDict } from "../i18n";
import base from "../styles/base.module.css";
import s from "./Report.module.css";

/** Demo figures — the dashboard says so in plain sight. */
const KPI = { registered: 6240, attended: 4380, turnout: 0.7, companies: 2150 };
const DAYS = [1820, 1510, 1050];
const INDUSTRIES = [0.32, 0.24, 0.18, 0.11, 0.15];
const ROLES = [0.38, 0.27, 0.22, 0.13];

export default function Report({ report, intl }: { report: OfferDict["report"]; intl: string }) {
  const num = new Intl.NumberFormat(intl);
  const pct = new Intl.NumberFormat(intl, { style: "percent", maximumFractionDigits: 0 });
  const maxDay = Math.max(...DAYS);

  const bars = (labels: readonly string[], values: number[]) => (
    <ul className={s.hbars}>
      {labels.map((label, i) => (
        <li key={label} style={{ ["--i" as string]: i, ["--v" as string]: values[i] / Math.max(...values) }}>
          <span className={s.hlabel}>{label}</span>
          <span className={s.hvalue}>{pct.format(values[i])}</span>
          <span className={s.htrack} aria-hidden="true"><span className={s.hfill} /></span>
        </li>
      ))}
    </ul>
  );

  return (
    <section className={`${base.section} ${base.sectionGrey}`} aria-labelledby="report-title">
      <div className={base.container}>
        <div className={base.head} data-reveal="">
          <p className={base.kicker}>{report.kicker}</p>
          <h2 id="report-title" className={base.h2}><Title text={report.title} /></h2>
        </div>

        <div className={s.layout}>
          <figure className={s.dash} data-reveal="" aria-label={`${report.dashboard} — ${report.demo}`}>
            <div className={s.dashHead}>
              <span className={s.dashTitle}>
                <span className={s.live} aria-hidden="true" />
                {report.dashboard}
              </span>
              <span className={s.demo}>{report.demo}</span>
            </div>

            <ul className={s.kpis}>
              <li>
                <CountUp value={KPI.registered} display={num.format(KPI.registered)} locale={intl} className={s.kpiValue} />
                <span className={s.kpiLabel}>{report.kpi.registered}</span>
              </li>
              <li>
                <CountUp value={KPI.attended} display={num.format(KPI.attended)} locale={intl} className={s.kpiValue} />
                <span className={s.kpiLabel}>{report.kpi.attended}</span>
              </li>
              <li className={s.kpiAccent}>
                <span className={s.kpiValue}>{pct.format(KPI.turnout)}</span>
                <span className={s.kpiLabel}>{report.kpi.turnout}</span>
              </li>
              <li>
                <CountUp value={KPI.companies} display={num.format(KPI.companies)} locale={intl} className={s.kpiValue} />
                <span className={s.kpiLabel}>{report.kpi.companies}</span>
              </li>
            </ul>

            <div className={s.charts} data-reveal="trigger">
              <div className={s.panel}>
                <p className={s.panelTitle}>{report.byDay}</p>
                <ul className={s.days}>
                  {DAYS.map((v, i) => (
                    <li key={i} style={{ ["--i" as string]: i, ["--v" as string]: v / maxDay }}>
                      <span className={s.dayValue}>{num.format(v)}</span>
                      <span className={s.dayTrack} aria-hidden="true"><span className={s.dayFill} /></span>
                      <span className={s.dayLabel}>{fill(report.day, { n: i + 1 })}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={s.panel}>
                <p className={s.panelTitle}>{report.industriesTitle}</p>
                {bars(report.industries, INDUSTRIES)}
              </div>
              <div className={`${s.panel} ${s.panelWide}`}>
                <p className={s.panelTitle}>{report.rolesTitle}</p>
                {bars(report.roles, ROLES)}
              </div>
            </div>
          </figure>

          <div className={s.receive} data-reveal="" style={{ ["--d" as string]: 1 }}>
            <h3 className={s.receiveTitle}>{report.receiveTitle}</h3>
            <ol className={s.receiveList}>
              {report.receive.map((item, i) => (
                <li key={item.title}>
                  <span className={s.receiveNum} aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className={s.receiveItem}>{item.title}</p>
                    <p className={s.receiveText}>{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
