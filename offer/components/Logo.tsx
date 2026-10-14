/**
 * The ExpoContact lockup, from the vector master (expocontact_logo.svg).
 * "color" keeps the navy gradient; "white" is the version for dark
 * backgrounds — the navy parts turn white, the orange stays orange.
 *
 * `idPrefix` keeps gradient ids unique when the logo appears twice on a page.
 */
import { LOGO_SHAPES, LOGO_VIEWBOX } from "../lib/logo";

interface LogoProps {
  tone?: "color" | "white";
  idPrefix?: string;
  className?: string;
  label?: string;
}

const GRADIENTS = [
  { id: "g0", x1: 55.33, y1: 99.72, x2: 44.68, y2: 0.29 },
  { id: "g1", x1: 47.07, y1: 77.35, x2: 52.93, y2: 22.66 },
  { id: "g2", x1: 89.93, y1: 99.94, x2: 87.57, y2: 77.56 },
  { id: "g3", x1: 183.56, y1: 56.19, x2: 182.56, y2: 19.57 },
] as const;

export default function Logo({ tone = "color", idPrefix = "lg", className, label = "ExpoContact" }: LogoProps) {
  const blue = (g: string) => (tone === "white" ? "#fff" : `url(#${idPrefix}${g})`);
  const orange = "#EC691F";

  return (
    <svg viewBox={LOGO_VIEWBOX} role="img" aria-label={label} className={className}>
      {tone === "color" && (
        <defs>
          {GRADIENTS.map((g) => (
            <linearGradient key={g.id} id={`${idPrefix}${g.id}`} gradientUnits="userSpaceOnUse"
              x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2}>
              <stop offset="0" stopColor="#1C4586" />
              <stop offset="1" stopColor="#1B4E9B" />
            </linearGradient>
          ))}
        </defs>
      )}
      {LOGO_SHAPES.map((shape, i) => {
        const fill = shape.part === "orange" ? orange : blue(shape.gradient ?? "g0");
        return shape.tag === "path"
          ? <path key={i} fill={fill} d={shape.data} />
          : <polygon key={i} fill={fill} points={shape.data} />;
      })}
    </svg>
  );
}
