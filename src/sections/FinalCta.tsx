import { useEffect, useRef, useState, type FormEvent, type PointerEvent } from "react";
import { CRESCENT } from "../components/Glyph";
import Shape from "../components/Shape";
import { Button } from "../components/ui";
import { prefersReducedMotion, useReveal } from "../components/hooks";
import "./FinalCta.css";

type Phase = "idle" | "form" | "done";

/*
  Placeholder sign-up: there is no backend, so nothing is sent or stored.
  The button morphs into the field (same box, new contents), and on submit the
  crescent fills in to a full circle: the quest is "complete".
*/
export default function FinalCta() {
  const ref = useReveal<HTMLElement>();
  const [phase, setPhase] = useState<Phase>("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (phase === "form") inputRef.current?.focus();
    if (phase === "done") doneRef.current?.focus();
  }, [phase]);

  // Magnetic pull: the button drifts toward a nearby pointer, then springs home.
  const pull = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || prefersReducedMotion()) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", `${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px`);
    el.style.setProperty("--py", `${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px`);
  };
  const release = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--px", "0px");
    e.currentTarget.style.setProperty("--py", "0px");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPhase("done");
  };

  return (
    <section ref={ref} id="join" className="final panel panel--lime on-light" aria-labelledby="final-title">
      <div className="container final__inner">
        <h2 id="final-title" className="display d1 final__title reveal">
          Your next skill won’t learn itself.
        </h2>
        <p className="final__sub reveal" style={{ ["--i" as string]: 1 }}>
          Pick something worth learning. Make something worth showing.
        </p>

        <div className="reveal" style={{ ["--i" as string]: 2 }}>
          <div className={`join join--${phase}`} onPointerMove={pull} onPointerLeave={release}>
            {phase === "idle" && (
              <Button variant="ink" className="join__btn" onClick={() => setPhase("form")}>
                Find your first quest
                <span className="join__arrow" aria-hidden="true">→</span>
              </Button>
            )}

            {phase === "form" && (
              <form className="join__form" onSubmit={onSubmit}>
                <label htmlFor="join-email" className="sr-only">
                  Email address
                </label>
                <input
                  ref={inputRef}
                  id="join-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                <Button type="submit" className="join__submit">
                  Get early access
                </Button>
              </form>
            )}

            {phase === "done" && (
              <div className="join__done">
                <svg className="moon" viewBox="0 0 80 80" width="40" height="40" aria-hidden="true">
                  <defs>
                    <clipPath id="moon-clip">
                      <circle cx="40" cy="40" r="39.9" />
                    </clipPath>
                  </defs>
                  <path d={CRESCENT} />
                  <circle className="moon__fill" cx="75" cy="10" r="40" clipPath="url(#moon-clip)" />
                </svg>
                <p ref={doneRef} tabIndex={-1}>
                  You’re on the list.
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="final__proto">
          Concept only: nothing is sent.
        </p>
      </div>

      <div className="final__shape final__shape--flower">
        <Shape name="flower" size="100%" />
      </div>
      <div className="final__shape final__shape--pinwheel">
        <Shape name="pinwheel" size="100%" />
      </div>

      <footer className="footer">
        <span className="footer__logo">Sidequest</span>
        <span className="footer__note">A design concept. Examples and data are illustrative.</span>
        <a href="#main" className="footer__top">
          Back to top ↑
        </a>
      </footer>
    </section>
  );
}
