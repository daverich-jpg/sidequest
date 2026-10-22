import Hero from "./sections/Hero";
import Problem from "./sections/Problem";
import Method from "./sections/Method";
import FeaturedQuest from "./sections/FeaturedQuest";
import Resources from "./sections/Resources";
import Work from "./sections/Work";
import FinalCta from "./sections/FinalCta";

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Hero />
      <main id="main">
        <Problem />
        <Method />
        <FeaturedQuest />
        <Resources />
        <Work />
        <FinalCta />
      </main>
    </>
  );
}
