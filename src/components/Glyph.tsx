import type { CSSProperties } from "react";

/*
  The hero's three glyphs, redrawn from the Figma SVGs (same path data) so they
  can take currentColor and animate. Across the page they carry one meaning each:
    flower   → learn   (many directions, one centre)
    pinwheel → solve   (four parts turning as one)
    crescent → show    (unfinished until you put it out there)
*/
export type GlyphName = "flower" | "pinwheel" | "crescent";

export const PETAL =
  "M28.1716 6.74219C27.7432 4.2945 29.6268 2.05267 32.1117 2.05267H47.966C50.4246 2.05267 52.3012 4.24984 51.9167 6.67821L44.386 54.241C43.6794 58.7035 37.2739 58.7554 36.495 54.305L28.1716 6.74219Z";

export const PINWHEEL =
  "M40 40C40 60.7431 24.2102 77.7985 3.99444 79.803C1.79607 80.021 0 78.2091 0 76V44C0 41.7909 1.79086 40 4 40H40ZM40 40C60.7431 40.0002 77.7979 55.7898 79.8021 76.0056C80.02 78.204 78.2082 80 75.999 80H43.9991C41.7899 80 39.9991 78.2091 39.9991 75.9999L40 40ZM39.9991 36C39.9991 38.2092 38.203 40.021 36.0047 39.803C17.1028 37.9288 2.07092 22.8964 0.19694 3.9944C-0.0210099 1.79604 1.79086 0 4 0H35.9999C38.2091 0 40 1.79092 39.9999 4.0001L39.9991 36ZM80 36C80 38.2091 78.2091 40 76 40H40C40 19.2567 55.7896 2.20125 76.0056 0.196945C78.204 -0.0210102 80 1.79086 80 4V36Z";

/* The pinwheel union split into its four quarters: BL, BR, TL, TR. */
export const PINWHEEL_QUARTERS = PINWHEEL.split("Z")
  .filter((d) => d.trim())
  .map((d) => `${d}Z`);

export const CRESCENT =
  "M30.6338 1.01206C33.3199 0.367667 35.5144 2.90925 35.2237 5.65623C35.0759 7.05214 35 8.46947 35 9.90454C35 31.9959 52.9086 49.9045 75 49.9045C76.8483 49.9045 78.303 51.6088 77.682 53.3496C72.16 68.8277 57.3748 79.9064 40 79.9065C17.9087 79.9065 0.000131124 61.9978 0 39.9065C0 21.0406 13.0609 5.22776 30.6338 1.01206Z";

type Props = {
  name: GlyphName;
  size?: number | string;
  className?: string;
  style?: CSSProperties;
};

export default function Glyph({ name, size = 80, className, style }: Props) {
  const common = {
    width: size,
    height: size,
    fill: "currentColor",
    "aria-hidden": true,
    focusable: false,
    className,
    style,
  } as const;

  if (name === "flower") {
    return (
      <svg viewBox="0 0 80 80" {...common}>
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={PETAL} transform={`rotate(${i * 45} 40 40)`} />
        ))}
      </svg>
    );
  }

  if (name === "pinwheel") {
    return (
      <svg viewBox="0 0 80 80" {...common}>
        <path d={PINWHEEL} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 78.7638 79.9059" {...common}>
      <path d={CRESCENT} />
    </svg>
  );
}
