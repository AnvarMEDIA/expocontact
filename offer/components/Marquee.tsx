/**
 * An endless row of plates. CSS only: the list is rendered twice and slides
 * by exactly one copy, so the loop has no seam. Pauses on hover and on
 * keyboard focus; under prefers-reduced-motion it becomes a static,
 * wrapping list. The duplicate copy is hidden from screen readers.
 */
import s from "./Marquee.module.css";

export default function Marquee({ items, label, reverse = false }: {
  items: readonly string[];
  label: string;
  reverse?: boolean;
}) {
  return (
    <div className={`${s.marquee} ${reverse ? s.reverse : ""}`} aria-label={label} role="group">
      <div className={s.track}>
        <ul className={s.list}>
          {items.map((item) => <li key={item} className={s.plate}>{item}</li>)}
        </ul>
        <ul className={`${s.list} ${s.copy}`} aria-hidden="true">
          {items.map((item) => <li key={item} className={s.plate}>{item}</li>)}
        </ul>
      </div>
    </div>
  );
}
