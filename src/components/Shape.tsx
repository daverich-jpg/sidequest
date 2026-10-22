import { useId, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { CRESCENT, PETAL, PINWHEEL_QUARTERS, type GlyphName } from "./Glyph";
import "./Shape.css";

/*
  The hero glyphs as touchable objects. Same path data as the Figma assets.

  Hover (or tap) does the thing each shape means:
    flower   → petals bloom out, the flower turns one petal (45°)
    pinwheel → the four quarters part, then turn a quarter (90°) as one
    crescent → the bite fills in and the moon becomes whole

  Turns accumulate instead of rewinding on leave. Every shape is symmetric
  under its step, so it always settles on the original silhouette: an
  endless spin with no seam.
*/
type Props = {
  name: GlyphName;
  size?: number | string;
  className?: string;
  style?: CSSProperties;
  /** Render inside a lime quest-box tile. */
  tile?: boolean;
  /** Spin on scroll is handled elsewhere; this disables hover (e.g. reduced UI). */
  inert?: boolean;
};

const STEP: Record<GlyphName, number> = { flower: 45, pinwheel: 90, crescent: 0 };

export default function Shape({ name, size = 80, className = "", style, tile, inert }: Props) {
  const [turns, setTurns] = useState(0);
  const [hot, setHot] = useState(false);
  const timer = useRef(0);
  const clipId = `moon${useId().replace(/:/g, "")}`;

  const enter = (e: PointerEvent) => {
    if (inert) return;
    if (e.pointerType !== "mouse") return;
    setTurns((t) => t + 1);
    setHot(true);
  };
  const leave = (e: PointerEvent) => {
    if (e.pointerType === "mouse") setHot(false);
  };
  // Touch/pen: a tap plays the whole gesture, then lets go.
  const tap = (e: PointerEvent) => {
    if (inert || e.pointerType === "mouse") return;
    setTurns((t) => t + 1);
    setHot(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setHot(false), 650);
  };

  const svgStyle = { ["--turn" as string]: `${turns * STEP[name]}deg` } as CSSProperties;

  let art;
  if (name === "flower") {
    art = (
      <svg viewBox="0 0 80 80" width={size} height={size} style={svgStyle} aria-hidden="true" focusable="false">
        <g className="shape__spin">
          {Array.from({ length: 8 }, (_, i) => (
            <g key={i} transform={`rotate(${i * 45} 40 40)`}>
              <path className="shape__petal" d={PETAL} style={{ ["--i" as string]: i }} />
            </g>
          ))}
        </g>
      </svg>
    );
  } else if (name === "pinwheel") {
    art = (
      <svg viewBox="0 0 80 80" width={size} height={size} style={svgStyle} aria-hidden="true" focusable="false">
        <g className="shape__spin">
          {PINWHEEL_QUARTERS.map((d, i) => (
            <path key={i} className={`shape__q shape__q--${i}`} d={d} />
          ))}
        </g>
      </svg>
    );
  } else {
    // The bite is a circle centred at (75, 10); scaling it from 0 inside a
    // clip of the full disc closes the crescent into a moon.
    const id = clipId;
    art = (
      <svg viewBox="0 0 78.7638 79.9059" width={size} height={size} aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={id}>
            <circle cx="40" cy="39.95" r="39.9" />
          </clipPath>
        </defs>
        <g className="shape__spin">
          <path d={CRESCENT} />
          <circle className="shape__bite" cx="75" cy="10" r="40.5" clipPath={`url(#${id})`} />
        </g>
      </svg>
    );
  }

  return (
    <span
      className={`shape shape--${name} ${hot ? "is-hot" : ""} ${tile ? "shape--tile" : ""} ${className}`}
      style={style}
      onPointerEnter={enter}
      onPointerLeave={leave}
      onPointerDown={tap}
      aria-hidden="true"
    >
      {art}
    </span>
  );
}
