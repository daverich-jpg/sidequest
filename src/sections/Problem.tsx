import { useEffect, useRef } from "react";
import Glyph, { type GlyphName } from "../components/Glyph";
import Shape from "../components/Shape";
import { Rise } from "../components/ui";
import { prefersReducedMotion, useReveal } from "../components/hooks";
import "./Problem.css";

type Video = { title: string; length: string; tone: "violet" | "raised" | "lime"; glyph: GlyphName };

// Illustrative queue — generic titles, no real channels.
const QUEUE: Video[] = [
  { title: "RAG explained in 12 minutes", length: "12:08", tone: "violet", glyph: "flower" },
  { title: "Vector databases for absolute beginners", length: "24:51", tone: "raised", glyph: "pinwheel" },
  { title: "Prompt engineering: the complete guide", length: "1:02:17", tone: "lime", glyph: "crescent" },
  { title: "Build your own chatbot (part 1 of 9)", length: "38:40", tone: "violet", glyph: "pinwheel" },
  { title: "Fine-tuning vs. retrieval, which one?", length: "16:33", tone: "raised", glyph: "flower" },
  { title: "Embeddings, visually explained", length: "21:12", tone: "lime", glyph: "flower" },
  { title: "AI agents crash course", length: "47:05", tone: "violet", glyph: "crescent" },
  { title: "Every AI tool you need this week", length: "09:58", tone: "raised", glyph: "pinwheel" },
];

function QueueItem({ v }: { v: Video }) {
  return (
    <li className="queue__item">
      <span className={`queue__thumb queue__thumb--${v.tone}`}>
        <Glyph name={v.glyph} size={18} />
        <span className="queue__len">{v.length}</span>
      </span>
      <span className="queue__meta">
        <span className="queue__title">{v.title}</span>
        <span className="queue__bar" />
      </span>
    </li>
  );
}

const PlayIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
  </svg>
);

export default function Problem() {
  const ref = useReveal<HTMLElement>();
  const trackRef = useRef<HTMLUListElement>(null);

  // Binge physics: scrolling fast makes the queue run faster, then it eases
  // back to its idle pace. The feed always outruns you.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || prefersReducedMotion()) return;
    const anim = track.getAnimations()[0];
    if (!anim) return;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let rate = 1;
    let target = 1;
    let raf = 0;
    const tick = () => {
      rate += (target - rate) * 0.08;
      target += (1 - target) * 0.06;
      anim.playbackRate = rate;
      raf = Math.abs(rate - 1) > 0.01 || Math.abs(target - 1) > 0.01 ? requestAnimationFrame(tick) : 0;
    };
    const onScroll = () => {
      const now = performance.now();
      const v = Math.abs(window.scrollY - lastY) / Math.max(16, now - lastT); // px/ms
      lastY = window.scrollY;
      lastT = now;
      target = Math.min(8, Math.max(target, 1 + v * 4));
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={ref} className="problem panel panel--ink" aria-labelledby="problem-title">
      <div className="container problem__grid">
        <header className="problem__head">
          <h2 id="problem-title" className="display d2 reveal">
            <Rise text="You’ve watched the tutorials." />{" "}
            <span className="problem__now">
              <Rise text="Now what?" delay={4} />
              <span className="problem__cursor" aria-hidden="true" />
            </span>
          </h2>
          <p className="lead muted reveal" style={{ ["--i" as string]: 3 }}>
            The next course is always one click away. But knowing what to watch and knowing what
            to do are two different things.
          </p>
        </header>

        <figure className="queue reveal" style={{ ["--i" as string]: 2 }}>
          <div className="queue__top" aria-hidden="true">
            <span className="queue__lines">
              <i />
              <i />
              <i />
            </span>
            <span className="queue__switch" />
          </div>
          <div className="queue__viewport" aria-hidden="true">
            <ul ref={trackRef} className="queue__track">
              {[...QUEUE, ...QUEUE].map((v, i) => (
                <QueueItem key={i} v={v} />
              ))}
            </ul>
          </div>
          <div className="queue__ledger" aria-hidden="true">
            <div className="queue__row queue__row--watched">
              <span className="queue__ico">
                <PlayIcon />
              </span>
              <span className="queue__meter">
                <span />
              </span>
            </div>
            <div className="queue__row queue__row--built">
              <span className="queue__ico">
                <Glyph name="pinwheel" size={14} />
              </span>
              <span className="queue__meter">
                <span />
              </span>
            </div>
          </div>
          <figcaption className="sr-only">
            Illustration: an autoplay queue of AI tutorials that never ends. Every video is marked
            watched; the meter for things built stays empty.
          </figcaption>
        </figure>

        <div className="problem__turn reveal">
          <Shape name="pinwheel" size={40} className="problem__turn-glyph" />
          <p className="display d4">
            If that sounds familiar, the missing piece probably isn’t another course. It’s a real
            problem to put it to work on.
          </p>
        </div>
      </div>
    </section>
  );
}
