import { Fragment, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
import { type GlyphName } from "./Glyph";
import Shape from "./Shape";
import "./ui.css";

type Variant = "primary" | "ghost" | "ink";

/* Hero buttons: lime fill / 16px radius (primary) and bare text (ghost).
   "ink" is the primary inverted, for use on lime surfaces. */
export function ButtonLink({
  variant = "primary",
  className = "",
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant }) {
  return <a className={`btn btn--${variant} ${className}`} {...rest} />;
}

export function Button({
  variant = "primary",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`btn btn--${variant} ${className}`} {...rest} />;
}

/* A section heading block: the section's shape in a quest-box tile, headline, one line of support. */
export function SectionHead({
  glyph,
  title,
  children,
  id,
  className = "",
}: {
  glyph: GlyphName | "all";
  title: ReactNode;
  children?: ReactNode;
  id: string;
  className?: string;
}) {
  return (
    <header className={`section-head ${className}`}>
      {glyph === "all" ? (
        <span className="shape-trio">
          <Shape name="flower" size={18} />
          <Shape name="pinwheel" size={18} />
          <Shape name="crescent" size={18} />
        </span>
      ) : (
        <Shape name={glyph} size={28} tile />
      )}
      <h2 id={id} className="display d2">
        {typeof title === "string" ? <Rise text={title} /> : title}
      </h2>
      {children && <p className="lead muted">{children}</p>}
    </header>
  );
}

/*
  Headline reveal: each word rises from behind its own baseline mask when the
  nearest .reveal ancestor gets .is-in. Text stays real text for readers.
*/
export function Rise({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        // The space must sit outside the inline-block mask, or it collapses.
        <Fragment key={i}>
          <span className="rise">
            <span className="rise__in" style={{ ["--w" as string]: i + delay }}>
              {w}
            </span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </>
  );
}
