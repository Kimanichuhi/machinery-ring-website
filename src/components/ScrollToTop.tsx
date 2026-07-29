import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scrolls window and document root to top on every route change. */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Run twice: once immediately, once after paint — guarantees top even
    // when Suspense resolves the next page after the initial layout pass.
    const toTop = () => {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    };
    toTop();
    const r = requestAnimationFrame(toTop);
    return () => cancelAnimationFrame(r);
  }, [pathname]);
  return null;
}

