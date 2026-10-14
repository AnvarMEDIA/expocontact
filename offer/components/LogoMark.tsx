/**
 * The logo's symbol as a large decorative drawing: the two arcs are traced as
 * strokes (stroke-dashoffset, 1.6 s), then the orange centre and corner pieces
 * appear, then the whole mark turns very slowly. Geometry follows the vector
 * master: ring centre at (50, 50), outer ring 38.07–50, inner ring 16.73–27.5.
 *
 * Purely decorative — aria-hidden, no text.
 */
import styles from "./LogoMark.module.css";

interface LogoMarkProps {
  className?: string;
  /** Draw the arcs on mount. Off for static repeats of the mark. */
  animate?: boolean;
}

export default function LogoMark({ className, animate = true }: LogoMarkProps) {
  return (
    <svg viewBox="-2 -2 104 104" aria-hidden="true" focusable="false"
      className={`${styles.mark} ${animate ? styles.animate : ""} ${className ?? ""}`}>
      <g className={styles.spin}>
        <path className={styles.ring} pathLength={1} strokeWidth={11.93}
          d="M94.035 55.36 L94.035 50 A44.035 44.035 0 1 0 50 94.035 L55.7 94.035" />
        <path className={`${styles.ring} ${styles.ringInner}`} pathLength={1} strokeWidth={10.77}
          d="M72.115 55.42 L72.115 50 A22.115 22.115 0 1 0 50 72.115 L55.76 72.115" />
        <g className={styles.pieces}>
          <path className={styles.orange} d="M55.67 55.67l-5.67 0c-3.12,0 -5.67,-2.55 -5.67,-5.67 0,-3.12 2.55,-5.67 5.67,-5.67 3.12,0 5.67,2.55 5.67,5.67l0 5.67z" />
          <polygon className={styles.orange} points="100,61.67 61.67,61.67 61.67,100 70.84,100 70.84,70.84 100,70.84" />
          <polygon className={styles.square} points="77.5,77.5 100,77.5 100,100 77.5,100" />
        </g>
      </g>
    </svg>
  );
}
