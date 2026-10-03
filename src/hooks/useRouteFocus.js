import { useEffect, useRef } from "react";

/**
 * Records a page view / route navigation into the session history stack so
 * "back" behaves predictably inside the SPA. Kept intentionally small.
 */
export function useRouteFocus(deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    ref.current?.focus?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}
