import { useEffect, useRef, useState, type FormEvent } from "react";
import { ButtonLink } from "../components/ui";
import { prefersReducedMotion } from "../components/hooks";
import magnifier from "../assets/shapes/magnifier.svg";
import Shape from "../components/Shape";
import "./Hero.css";

/* Hero — Figma 1364:884, built 1:1. Motion only animates *into* the designed state. */
export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [searchNote, setSearchNote] = useState("");

  // The big flower turns slowly with scroll. 8-fold symmetry means any
  // multiple of 45° lands on the original silhouette.
  useEffect(() => {
    const el = heroRef.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = Math.min(window.scrollY, window.innerHeight * 1.5);
        el.style.setProperty("--spin", `${y * 0.06}deg`);
      });
    };
    // Gravity: the corner shapes lean a few px toward the pointer.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      el.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearchNote("Search isn't connected in this prototype.");
    window.setTimeout(() => setSearchNote(""), 3200);
  };

  return (
    <section ref={heroRef} className="hero panel panel--ink" aria-labelledby="hero-title">
      <header className="hero__nav">
        <a href="#" className="hero__logo" aria-label="Sidequest home">
          LOGO
        </a>
        <div className="hero__nav-right">
          <form role="search" className="hero__search" onSubmit={onSearch}>
            <img src={magnifier} width={24} height={24} alt="" />
            <label htmlFor="site-search" className="sr-only">
              Search
            </label>
            <input
              id="site-search"
              type="search"
              placeholder="Search classes, case studies and more"
              autoComplete="off"
            />
            <span className="hero__search-note" role="status">
              {searchNote}
            </span>
          </form>
          <nav className="hero__actions" aria-label="Account">
            <ButtonLink href="#join" variant="ghost" className="hero__btn">
              Sign in
            </ButtonLink>
            <ButtonLink href="#join" className="hero__btn hero__btn--signup">
              Sign up
            </ButtonLink>
          </nav>
        </div>
      </header>

      <div className="hero__body">
        <div className="hero__copy">
          <h1 id="hero-title" className="hero__title" aria-label="Learn skills you can actually use">
            <span className="hero__row" aria-hidden="true">
              <span className="hero__word hero__word--1">Learn</span>
              <span className="hero__box">
                <Shape name="flower" size="100%" className="hero__g hero__g--flower" />
                <Shape name="pinwheel" size="100%" className="hero__g hero__g--pinwheel" />
                <Shape name="crescent" size="100%" className="hero__g hero__g--crescent" />
              </span>
              <span className="hero__word hero__word--2">Skills</span>
            </span>
            <span className="hero__line" aria-hidden="true">
              you can actually use
            </span>
          </h1>
          <p className="hero__sub">
            Watching tutorials feels like progress until you have to build something. Sidequest
            gives you a real problem, the right resources, and a finished thing to show for it.
          </p>
        </div>
        <div className="hero__ctas">
          <ButtonLink href="#quest" className="hero__cta">
            Start a quest
          </ButtonLink>
          <ButtonLink href="#method" variant="ghost" className="hero__cta">
            See how it works
          </ButtonLink>
        </div>
      </div>

      <div className="hero__shape hero__shape--crescent" aria-hidden="true">
        <Shape name="crescent" size="100%" className="hero__big" />
      </div>
      <div className="hero__shape hero__shape--flower" aria-hidden="true">
        <Shape name="flower" size="100%" className="hero__big" />
      </div>
    </section>
  );
}
