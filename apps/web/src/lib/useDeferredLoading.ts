import { useEffect, useState } from "react";

/** True after `active` stays true for `delayMs` (avoids flicker on fast requests). */
export function useDeferredLoading(active: boolean, delayMs = 320): boolean {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!active) {
      setShow(false);
      return;
    }
    const id = window.setTimeout(() => setShow(true), delayMs);
    return () => window.clearTimeout(id);
  }, [active, delayMs]);
  return show;
}
