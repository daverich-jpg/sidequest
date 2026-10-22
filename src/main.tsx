import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tokens.css";
import "./styles/base.css";

// In-page links glide; nothing else does. (A global `scroll-behavior: smooth`
// would also animate reload's scroll restoration through the whole page.)
document.addEventListener("click", (e) => {
  const a = (e.target as Element).closest?.('a[href^="#"]');
  if (!a || e.defaultPrevented) return;
  const id = a.getAttribute("href")!.slice(1);
  const target = id ? document.getElementById(id) : document.body;
  if (!target) return;
  e.preventDefault();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  // Keep keyboard focus with the jump (skip link, CTAs), as native anchors do.
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  history.replaceState(null, "", id ? `#${id}` : location.pathname + location.search);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
