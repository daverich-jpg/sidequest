import type { PointerEvent } from "react";
import Glyph from "../components/Glyph";
import Shape from "../components/Shape";
import { SectionHead } from "../components/ui";
import { prefersReducedMotion, useReveal } from "../components/hooks";
import "./Work.css";

type Verdict = "g" | "p" | "w";
const run = (g: number, p: number, w: number): Verdict[] => [
  ...Array<Verdict>(g).fill("g"),
  ...Array<Verdict>(p).fill("p"),
  ...Array<Verdict>(w).fill("w"),
];

// Example data for the illustration — not results from a real learner.
const V1 = run(11, 5, 4);
const V2 = run(15, 3, 2);

function Dots({ data, label, row }: { data: Verdict[]; label: string; row: number }) {
  const g = data.filter((d) => d === "g").length;
  return (
    <div className="report__row" style={{ ["--row" as string]: row }}>
      <span className="report__ver">{label}</span>
      <span className="report__dots" aria-hidden="true">
        {data.map((d, i) => (
          <span key={i} className={`dot dot--${d}`} style={{ ["--d" as string]: i }} />
        ))}
      </span>
      <span className="report__score">
        {g}/{data.length}
      </span>
    </div>
  );
}

/* Physical tilt: the artefact leans toward the pointer like a print in hand. */
function tilt(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse" || prefersReducedMotion()) return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  el.style.setProperty("--ry", `${(x * 8).toFixed(2)}deg`);
  el.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
}

function untilt(e: PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty("--ry", "0deg");
  e.currentTarget.style.setProperty("--rx", "0deg");
}

export default function Work() {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} id="work" className="work panel panel--ink" aria-labelledby="work-title">
      <div className="container">
        <div className="work__head reveal">
          <SectionHead id="work-title" glyph="crescent" title="Build a body of work, not just a list of certificates.">
            Each finished quest gives you something to share, the decisions behind it, and a
            clearer picture of what you understand.
          </SectionHead>
        </div>

        <ul className="gallery">
          {/* 01 — Prototype */}
          <li className="art art--proto reveal">
            <figure className="art__frame" onPointerMove={tilt} onPointerLeave={untilt}>
              <div className="proto">
                <div className="proto__bar" aria-hidden="true">
                  <span className="proto__dots">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="proto__url">lease-assistant · demo</span>
                </div>
                <div className="proto__body">
                  <aside className="proto__src" aria-hidden="true">
                    <span className="proto__file is-on">lease.pdf</span>
                    <span className="proto__file">house-rules.pdf</span>
                    <span className="proto__passage">
                      <span className="proto__ref">§14.2</span>
                      Tenant may paint interior walls provided they are{" "}
                      <mark className="hl hl--src">restored to the original colour</mark> before the
                      end of the tenancy…
                    </span>
                  </aside>
                  <div className="proto__chat">
                    <span className="proto__q">Can I paint my bedroom?</span>
                    <span className="proto__a">
                      <span>
                        Yes, if you <mark className="hl hl--ans">restore the original colour</mark>{" "}
                        before you move out.
                      </span>
                      <span className="proto__cite">
                        <Glyph name="crescent" size={10} /> §14.2
                      </span>
                    </span>
                    <span className="proto__input" aria-hidden="true">
                      <span className="proto__caret" />
                      <span className="proto__send" />
                    </span>
                  </div>
                </div>
              </div>
              <figcaption className="sr-only">
                Example AI prototype: a lease assistant that highlights the clause behind every answer.
              </figcaption>
            </figure>
          </li>

          {/* 02 — Evaluation report */}
          <li className="art art--report reveal" style={{ ["--i" as string]: 1 }}>
            <figure className="art__frame" onPointerMove={tilt} onPointerLeave={untilt}>
              <div className="report">
                <p className="report__title">Did bigger chunks help?</p>
                <Dots data={V1} label="v1" row={0} />
                <Dots data={V2} label="v2" row={1} />
              </div>
              <figcaption className="sr-only">
                Example evaluation report: version 1 answered 11 of 20 test questions correctly from
                the source; version 2 answered 15 of 20.
              </figcaption>
            </figure>
          </li>

          {/* 03 — Write-up */}
          <li className="art art--write reveal" style={{ ["--i" as string]: 2 }}>
            <figure className="art__frame" onPointerMove={tilt} onPointerLeave={untilt}>
              <div className="writeup">
                <p className="display writeup__title">
                  Bigger chunks fixed the deposit question and broke two others
                </p>
                <div className="writeup__trade">
                  <div>
                    <span className="writeup__sign" aria-label="Gained">+</span>
                    <p>Exceptions stay next to the rule they modify.</p>
                  </div>
                  <div>
                    <span className="writeup__sign" aria-label="Lost">−</span>
                    <p>Short factual answers got vaguer. Trying a re-ranker next.</p>
                  </div>
                </div>
                <Shape name="pinwheel" size={96} className="writeup__glyph" />
              </div>
              <figcaption className="sr-only">Example project write-up of trade-offs and lessons.</figcaption>
            </figure>
          </li>
        </ul>
      </div>
    </section>
  );
}
