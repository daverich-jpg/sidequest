import { useEffect, useRef, useState, type RefObject } from "react";

// ?motion=full overrides the OS setting, for testing in reduced-motion browsers.
export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  !window.location.search.includes("motion=full") &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Adds .is-in to every .reveal inside the root once it scrolls into view. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = root.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

/*
  Calls fn(progress 0→1) as the element travels from `start` to `end`
  (fractions of viewport height, measured at the element's top and bottom).
  rAF-throttled, only while the element is near the viewport.
*/
export function useScrollProgress(
  ref: RefObject<HTMLElement>,
  fn: (p: number) => void,
  start = 0.8,
  end = 0.45,
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let visible = false;

    const measure = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // top at start*vh → 0, bottom at end*vh → 1
      const from = start * vh;
      const span = r.height + from - end * vh;
      const p = Math.min(1, Math.max(0, (from - r.top) / span));
      fnRef.current(p);
    };
    const onScroll = () => {
      if (visible && !raf) raf = requestAnimationFrame(measure);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) onScroll();
    });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    measure();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref, start, end]);
}

export function useMediaQuery(query: string) {
  const [match, setMatch] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}
