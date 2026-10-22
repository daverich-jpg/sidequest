import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { type GlyphName } from "../components/Glyph";
import Shape from "../components/Shape";
import { SectionHead } from "../components/ui";
import { prefersReducedMotion, useReveal, useScrollProgress } from "../components/hooks";
import "./Method.css";

type Stage = { title: string; glyph: GlyphName | "quest" };

const STAGES: Stage[] = [
  { title: "Choose a quest", glyph: "quest" },
  { title: "Learn what you need", glyph: "flower" },
  { title: "Solve the problem", glyph: "pinwheel" },
  { title: "Show your work", glyph: "crescent" },
];

type Geo = { d: string; stops: number[]; w: number; h: number };

/* Orthogonal path through each node centre, then into the outcome card. */
function buildPath(points: { x: number; y: number }[]) {
  let d = `M${points[0].x} ${points[0].y}`;
  let len = 0;
  const stops = [0];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (Math.abs(a.x - b.x) < 1) d += ` V${b.y}`;
    else if (Math.abs(a.y - b.y) < 1) d += ` H${b.x}`;
    else {
      const mx = (a.x + b.x) / 2;
      d += ` H${mx} V${b.y} H${b.x}`;
    }
    len += Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
    stops.push(len);
  }
  return { d, stops: stops.map((s) => s / len) };
}

export default function Method() {
  const revealRef = useReveal<HTMLElement>();
  const pathRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  const puckRef = useRef<SVGCircleElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [reached, setReached] = useState(-1);
  const [static_, setStatic] = useState(false);

  const measure = useCallback(() => {
    const root = pathRef.current;
    const end = endRef.current;
    if (!root || !end) return;
    const box = root.getBoundingClientRect();
    const pts = nodeRefs.current.map((n) => {
      const r = n!.getBoundingClientRect();
      return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
    });
    const e = end.getBoundingClientRect();
    const last = pts[pts.length - 1];
    const vertical = Math.abs(pts[0].x - last.x) < 1;
    pts.push(
      vertical
        ? { x: last.x, y: e.top - box.top }
        : { x: e.left - box.left, y: last.y },
    );
    const { d, stops } = buildPath(pts);
    setGeo({ d, stops, w: box.width, h: box.height });
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (pathRef.current) ro.observe(pathRef.current);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    if (prefersReducedMotion()) setStatic(true);
  }, []);

  // The track fills as you scroll; each node lights up as the line reaches it.
  useScrollProgress(
    pathRef,
    (p) => {
      if (static_ || !geo) return;
      const fill = fillRef.current;
      fill?.style.setProperty("stroke-dashoffset", String(1 - p));
      // A puck rides the tip of the line, so progress has a "now".
      const puck = puckRef.current;
      if (fill && puck) {
        const pt = fill.getPointAtLength(p * fill.getTotalLength());
        puck.setAttribute("cx", String(pt.x));
        puck.setAttribute("cy", String(pt.y));
        puck.style.opacity = p > 0.001 && p < 0.999 ? "1" : "0";
      }
      let r = -1;
      geo.stops.forEach((s, i) => {
        if (p >= s - 0.001) r = i;
      });
      setReached(r);
    },
    0.8,
    0.65,
  );

  const isOn = (i: number) => static_ || reached >= i;

  return (
    <section
      ref={revealRef}
      id="method"
      className="method panel panel--cream on-light"
      aria-labelledby="method-title"
    >
      <div className="container">
        <div className="method__head reveal">
          <SectionHead id="method-title" glyph="all" title="Every quest starts with a problem worth solving." />
          <p className="lead muted method__lede">
            Choose a challenge. Learn what you need. Work through the hard parts. Finish with
            something you can show.
          </p>
        </div>

        <div ref={pathRef} className="method__path">
          {geo && (
            <svg className="method__svg" width={geo.w} height={geo.h} aria-hidden="true">
              <path d={geo.d} className="method__track" />
              <path
                ref={fillRef}
                d={geo.d}
                pathLength={1}
                className="method__fill"
                style={{ strokeDashoffset: static_ ? 0 : 1 }}
              />
              <circle ref={puckRef} r={7} className="method__puck" style={{ opacity: 0 }} />
            </svg>
          )}

          <ol className="method__stages">
            {STAGES.map((s, i) => (
              <li key={s.title} className={`stage stage--${i + 1} ${isOn(i) ? "is-on" : ""}`}>
                <span className="stage__node" ref={(el) => (nodeRefs.current[i] = el)}>
                  {s.glyph === "quest" ? (
                    <span className="stage__quest">
                      <Shape name="flower" size={16} />
                      <Shape name="pinwheel" size={16} />
                      <Shape name="crescent" size={16} />
                    </span>
                  ) : (
                    <Shape name={s.glyph} size={44} className="stage__glyph" />
                  )}
                </span>
                <h3 className="display d4 stage__title">{s.title}</h3>
              </li>
            ))}
          </ol>

          {/* What you leave with, shown rather than listed: demo, evidence, reasoning. */}
          <div
            ref={endRef}
            className={`outcome ${isOn(STAGES.length) ? "is-on" : ""}`}
            role="img"
            aria-label="You leave with a working demo, evidence that it works, and a write-up of your reasoning."
          >
            <span className="outcome__card outcome__card--demo">
              <i className="o-bubble o-bubble--q" />
              <i className="o-bubble o-bubble--a" />
              <i className="o-cite" />
            </span>
            <span className="outcome__card outcome__card--eval">
              {Array.from({ length: 16 }, (_, i) => (
                <i key={i} className={i < 12 ? "o-dot" : i < 14 ? "o-dot o-dot--part" : "o-dot o-dot--miss"} />
              ))}
            </span>
            <span className="outcome__card outcome__card--doc">
              <i className="o-line o-line--h" />
              <i className="o-line" />
              <i className="o-line" />
              <i className="o-line o-line--s" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
