import { useRef, useState, type ChangeEvent } from "react";
import Shape from "../components/Shape";
import { SectionHead } from "../components/ui";
import { prefersReducedMotion, useReveal } from "../components/hooks";
import "./Resources.css";

type Kind = "foundation" | "walkthrough" | "reference";

// Real, publicly available articles (links checked Oct 2026). The selection is illustrative.
const RESOURCES: { id: string; kind: Kind; title: string; author: string; host: string; href: string }[] = [
  {
    id: "embeddings",
    kind: "foundation",
    title: "What are embeddings?",
    author: "Vicki Boykis",
    host: "vickiboykis.com",
    href: "https://vickiboykis.com/what_are_embeddings/",
  },
  {
    id: "contextual",
    kind: "walkthrough",
    title: "Contextual retrieval",
    author: "Anthropic",
    host: "anthropic.com",
    href: "https://www.anthropic.com/research/contextual-retrieval",
  },
  {
    id: "evals",
    kind: "reference",
    title: "Your AI product needs evals",
    author: "Hamel Husain",
    host: "hamel.dev",
    href: "https://hamel.dev/blog/posts/evals/",
  },
];

/* Type, drawn instead of written: a concept map, a sequence of steps, a checklist. */
function KindIcon({ kind }: { kind: Kind }) {
  if (kind === "foundation")
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <circle cx="6" cy="7" r="3" />
        <circle cx="18" cy="6" r="2.5" />
        <circle cx="12" cy="18" r="3.5" />
        <path d="M8.5 8.5l2 6.5M15.8 7.5l-2.6 7.5M8.8 6.8l6.8-.6" strokeWidth="1.5" stroke="currentColor" fill="none" />
      </svg>
    );
  if (kind === "walkthrough")
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <rect x="3" y="4" width="5" height="5" rx="1.5" />
        <rect x="9.5" y="9.5" width="5" height="5" rx="1.5" />
        <rect x="16" y="15" width="5" height="5" rx="1.5" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M4 6.5l1.8 1.8L9 5M4 12.5l1.8 1.8L9 11M4 18.5l1.8 1.8L9 17" strokeWidth="1.8" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="11.5" y="5.5" width="9" height="2" rx="1" />
      <rect x="11.5" y="11.5" width="9" height="2" rx="1" />
      <rect x="11.5" y="17.5" width="6" height="2" rx="1" />
    </svg>
  );
}

const KIND_LABEL: Record<Kind, string> = {
  foundation: "Foundation",
  walkthrough: "Walkthrough",
  reference: "Reference",
};

export default function Resources() {
  const ref = useReveal<HTMLElement>();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const segRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const count = RESOURCES.filter((r) => done[r.id]).length;
  const ready = count === RESOURCES.length;

  // Motion lead: a dot travels from the checkbox into its meter segment, so the
  // eye follows cause → effect. The state itself updates instantly (optimistic).
  const fly = (from: HTMLElement, i: number) => {
    const to = segRefs.current[i];
    if (!to || prefersReducedMotion()) return;
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    const dot = document.createElement("span");
    dot.className = "fly-dot";
    dot.style.left = `${a.left + a.width / 2 - 6}px`;
    dot.style.top = `${a.top + a.height / 2 - 6}px`;
    document.body.appendChild(dot);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    dot
      .animate(
        [
          { transform: "translate(0, 0) scale(1)" },
          { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 60}px) scale(1.2)`, offset: 0.5 },
          { transform: `translate(${dx}px, ${dy}px) scale(0.5)` },
        ],
        { duration: 620, easing: "cubic-bezier(0.5, 0, 0.3, 1)" },
      )
      .finished.then(() => dot.remove());
    // Throttled tabs can stall `finished`; never leave a stray dot behind.
    window.setTimeout(() => dot.remove(), 900);
  };

  const toggle = (id: string, i: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const on = e.target.checked;
    setDone((d) => ({ ...d, [id]: on }));
    if (on) fly(e.target.parentElement as HTMLElement, i);
  };

  return (
    <section
      ref={ref}
      id="resources"
      className="resources panel panel--cream on-light"
      aria-labelledby="resources-title"
    >
      <div className="container resources__grid">
        <div className="resources__aside reveal">
          <SectionHead id="resources-title" glyph="flower" title="Less searching. More useful learning.">
            Start with focused resources selected for the problem you’re trying to solve, then put
            what you learn into practice.
          </SectionHead>
        </div>

        <div className="loadout reveal" style={{ ["--i" as string]: 1 }}>
          <div className="loadout__head">
            <p className="display loadout__step">Learn retrieval</p>
            <div className="loadout__meter" role="progressbar" aria-label="Resources done" aria-valuemin={0} aria-valuemax={3} aria-valuenow={count}>
              {RESOURCES.map((r, i) => (
                <span key={r.id} ref={(el) => (segRefs.current[i] = el)} className={done[r.id] ? "is-on" : ""} />
              ))}
            </div>
          </div>

          <ol className="tickets">
            {RESOURCES.map((r, i) => {
              const on = !!done[r.id];
              return (
                <li key={r.id} className={`ticket ticket--${r.kind} ${on ? "is-done" : ""}`} style={{ ["--d" as string]: i }}>
                  <span className="ticket__kind" title={KIND_LABEL[r.kind]}>
                    <KindIcon kind={r.kind} />
                    <span className="sr-only">{KIND_LABEL[r.kind]}: </span>
                  </span>
                  <div className="ticket__body">
                    <h3 className="display ticket__title">
                      <a href={r.href} target="_blank" rel="noreferrer">
                        {r.title}
                        <span className="sr-only"> (opens in a new tab)</span>
                        <span aria-hidden="true" className="ticket__arrow">
                          ↗
                        </span>
                      </a>
                    </h3>
                    <p className="ticket__src">
                      {r.author} · {r.host}
                    </p>
                  </div>
                  <label className="ticket__check">
                    <input type="checkbox" checked={on} onChange={toggle(r.id, i)} />
                    <span className="ticket__box" aria-hidden="true">
                      <svg viewBox="0 0 16 16" width="16" height="16">
                        <path d="M3 8.5l3 3 7-7" />
                      </svg>
                    </span>
                    <span className="sr-only">Mark “{r.title}” done</span>
                  </label>
                </li>
              );
            })}
          </ol>

          <a
            href="#quest"
            className={`unlock ${ready ? "is-ready" : ""}`}
            tabIndex={ready ? 0 : -1}
            aria-disabled={!ready}
            onClick={(e) => !ready && e.preventDefault()}
          >
            <span className="unlock__tile">
              <Shape name="pinwheel" size={28} className="unlock__glyph" inert />
            </span>
            <span className="unlock__next">Build a first version</span>
            <span className="unlock__arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
