import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Glyph from "../components/Glyph";
import { SectionHead } from "../components/ui";
import { prefersReducedMotion, useReveal } from "../components/hooks";
import "./FeaturedQuest.css";

/* Plays a short timeline: returns how many beats have elapsed. */
function useBeats(times: number[]) {
  const [beat, setBeat] = useState(() => (prefersReducedMotion() ? times.length : 0));
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ids = times.map((t, i) => window.setTimeout(() => setBeat(i + 1), t));
    return () => ids.forEach(clearTimeout);
  }, []);
  return beat;
}

/* ---------- Step mocks: each one acts out its step ---------- */

function FrameMock() {
  const sets = [
    { name: "Apartment lease + house rules", pages: "14 pages" },
    { name: "Course syllabus + lecture notes", pages: "32 pages" },
    { name: "A small team’s onboarding wiki", pages: "48 pages" },
  ];
  const beat = useBeats([420]);
  return (
    <div className="mock mock--frame">
      <ul className="docsets">
        {sets.map((s, i) => (
          <li key={s.name} className={`docset ${beat && i === 0 ? "is-on" : ""}`} style={{ ["--d" as string]: i }}>
            <span className="docset__stack" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="docset__name">{s.name}</span>
            <span className="docset__pages">{s.pages}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LearnMock() {
  const rows = [
    { title: "What are embeddings?", src: "vickiboykis.com" },
    { title: "Contextual retrieval", src: "anthropic.com" },
    { title: "Your AI product needs evals", src: "hamel.dev" },
  ];
  return (
    <div className="mock mock--learn">
      <ul className="learnrows">
        {rows.map((r, i) => (
          <li key={r.title} style={{ ["--d" as string]: i }}>
            <span className={`learnrows__n learnrows__n--${i + 1}`}>{i + 1}</span>
            <span className="learnrows__body">
              <span className="learnrows__title">{r.title}</span>
              <span className="learnrows__bar" />
            </span>
            <span className="learnrows__src">{r.src}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Typing() {
  return (
    <span className="typing" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

function BuildMock() {
  // q1 · typing · a1 · q2 · typing · a2
  const beat = useBeats([150, 500, 1300, 1900, 2250, 3000]);
  return (
    <div className="mock mock--build">
      <div className="chat" aria-live="off">
        {beat >= 1 && <p className="chat__q">Can I paint my bedroom walls?</p>}
        {beat === 2 && <Typing />}
        {beat >= 3 && (
          <div className="chat__a">
            <p>
              Yes, as long as you return them to the original colour before you move out, or pay
              for repainting.
            </p>
            <span className="chat__cite">
              <Glyph name="crescent" size={12} />
              lease.pdf · §14.2 Alterations
            </span>
          </div>
        )}
        {beat >= 4 && <p className="chat__q">Is there a gym in the building?</p>}
        {beat === 5 && <Typing />}
        {beat >= 6 && (
          <div className="chat__a chat__a--none">
            <p>I couldn’t find that in your documents.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TestMock() {
  const rows: [string, string, "pass" | "part" | "fail"][] = [
    ["When is rent due?", "§3.1", "pass"],
    ["Can I sublet for a month?", "§11.4", "part"],
    ["Who fixes a broken heater?", "§9.2", "pass"],
    ["Is the deposit refundable?", "§5.3", "fail"],
    ["Are pets allowed?", "Rules §2", "pass"],
  ];
  const label = { pass: "Grounded", part: "Partly", fail: "Wrong source" };
  return (
    <div className="mock mock--test">
      <table className="evals">
        <thead className="sr-only">
          <tr>
            <th scope="col">Question</th>
            <th scope="col">Answer in</th>
            <th scope="col">Verdict</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([q, src, v], i) => (
            <tr key={q} style={{ ["--d" as string]: i }}>
              <td>{q}</td>
              <td className="evals__src">{src}</td>
              <td>
                <span className={`verdict verdict--${v}`}>{label[v]}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WriteMock() {
  return (
    <div className="mock mock--write">
      <article className="memo">
        <h5 className="memo__title">Where my lease assistant breaks</h5>
        <p>
          Short chunks found the right clause more often but lost the exceptions written two
          paragraphs later. That’s why the deposit question failed…
        </p>
        <ul className="memo__list">
          <li style={{ ["--d" as string]: 0 }}><b>Kept:</b> citations on every answer</li>
          <li style={{ ["--d" as string]: 1 }}><b>Changed:</b> chunk size, 200 → 500 words</li>
          <li style={{ ["--d" as string]: 2 }}><b>Next:</b> clauses that point to other clauses</li>
        </ul>
      </article>
    </div>
  );
}

const STEPS: { key: string; label: string; mock: () => ReactNode }[] = [
  { key: "frame", label: "Frame", mock: () => <FrameMock /> },
  { key: "learn", label: "Learn", mock: () => <LearnMock /> },
  { key: "build", label: "Build", mock: () => <BuildMock /> },
  { key: "test", label: "Test", mock: () => <TestMock /> },
  { key: "write", label: "Write up", mock: () => <WriteMock /> },
];

/* ---------- Section ---------- */

export default function FeaturedQuest() {
  const ref = useReveal<HTMLElement>();
  const [active, setActive] = useState(2);
  const [dir, setDir] = useState(1);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  const go = (i: number) => {
    if (i === active) return;
    setDir(i > active ? 1 : -1);
    setActive(i);
  };

  // The indicator morphs between tabs rather than jumping.
  useLayoutEffect(() => {
    const place = () => {
      const t = tabRefs.current[active];
      const list = listRef.current;
      if (!t || !list) return;
      list.style.setProperty("--ix", `${t.offsetLeft}px`);
      list.style.setProperty("--iw", `${t.offsetWidth}px`);
    };
    place();
    const ro = new ResizeObserver(place);
    if (listRef.current) ro.observe(listRef.current);
    document.fonts?.ready.then(place);
    return () => ro.disconnect();
  }, [active]);

  const onKey = (e: KeyboardEvent) => {
    const last = STEPS.length - 1;
    let next = active;
    if (e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    go(next);
    tabRefs.current[next]?.focus();
  };

  const step = STEPS[active];

  return (
    <section ref={ref} id="quest" className="quest panel panel--ink" aria-labelledby="quest-title">
      <div className="container">
        <div className="quest__head reveal">
          <SectionHead id="quest-title" glyph="pinwheel" title="Build something useful. Understand how it works.">
            Learn the fundamentals of retrieval, test answers against source material, and document
            where your AI assistant succeeds or fails.
          </SectionHead>
        </div>

        <article className="qcard reveal" aria-labelledby="qcard-title">
          <div className="qcard__brief">
            <h3 id="qcard-title" className="display qcard__title">
              Build an AI assistant that answers questions from a set of documents
            </h3>
            <p className="qcard__challenge">
              Pick real documents, like a lease, a syllabus or a team wiki, and build an assistant
              that answers questions about them. It has to show where each answer came from, and
              admit when the documents don’t say.
            </p>
            <ul className="chips" aria-label="Skills explored">
              {["Embeddings", "Chunking", "Retrieval", "Prompting with sources", "Evaluation", "Technical writing"].map(
                (s, i) => (
                  <li key={s} style={{ ["--d" as string]: i }}>
                    {s}
                  </li>
                ),
              )}
            </ul>
            <ul className="deliver" aria-label="You’ll hand in">
              <li>
                <span className="deliver__thumb deliver__thumb--demo" aria-hidden="true">
                  <i />
                  <i />
                </span>
                Working assistant
              </li>
              <li>
                <span className="deliver__thumb deliver__thumb--eval" aria-hidden="true">
                  {Array.from({ length: 6 }, (_, i) => (
                    <i key={i} />
                  ))}
                </span>
                Evaluation sheet
              </li>
              <li>
                <span className="deliver__thumb deliver__thumb--doc" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                Write-up
              </li>
            </ul>
          </div>

          <div className="qcard__inside">
            <div
              ref={listRef}
              className="steps"
              role="tablist"
              aria-label="Quest steps"
              onKeyDown={onKey}
            >
              <span className="steps__indicator" aria-hidden="true" />
              {STEPS.map((s, i) => (
                <button
                  key={s.key}
                  ref={(el) => (tabRefs.current[i] = el)}
                  role="tab"
                  id={`tab-${s.key}`}
                  aria-selected={i === active}
                  aria-controls={`panel-${s.key}`}
                  tabIndex={i === active ? 0 : -1}
                  className={`steps__tab ${i < active ? "is-past" : ""}`}
                  onClick={() => go(i)}
                >
                  <span className="steps__n">{i + 1}</span>
                  {s.label}
                </button>
              ))}
            </div>

            <div
              key={step.key}
              role="tabpanel"
              id={`panel-${step.key}`}
              aria-labelledby={`tab-${step.key}`}
              className="step"
              style={{ ["--dir" as string]: dir }}
              tabIndex={0}
            >
              {step.mock()}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
