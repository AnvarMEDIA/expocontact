/** Renders a dictionary heading: [brackets] become the orange accent, \n a line break. */
import { Fragment } from "react";
import { parseTitle } from "../i18n";
import base from "../styles/base.module.css";

export default function Title({ text }: { text: string }) {
  // A non-breaking space keeps the dash on the line before it: «план — по…», never «— по…» opening a line.
  const lines = parseTitle(text.replace(/ —/g, "\u00a0—"));
  return (
    <>
      {lines.map((parts, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {parts.map((part, j) =>
            part.accent ? <span key={j} className={base.accent}>{part.text}</span> : <Fragment key={j}>{part.text}</Fragment>,
          )}
        </Fragment>
      ))}
    </>
  );
}
