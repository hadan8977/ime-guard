import { useEffect, useMemo } from "react";
import { createImeTracker, isImeComposing, type ImeTracker } from "./index";

/**
 * Spread the returned props on an input/textarea, then call
 * `isImeComposing(e)` at the top of your onKeyDown.
 */
export function useImeGuard(): {
  isImeComposing: (event: Parameters<typeof isImeComposing>[0]) => boolean;
  onCompositionStart: () => void;
  onCompositionEnd: () => void;
  tracker: ImeTracker;
} {
  const tracker = useMemo(() => createImeTracker(), []);
  useEffect(() => () => tracker.dispose(), [tracker]);
  return {
    isImeComposing: (event) => isImeComposing(event, tracker),
    onCompositionStart: tracker.onCompositionStart,
    onCompositionEnd: tracker.onCompositionEnd,
    tracker,
  };
}

export { isImeComposing, imeSafe } from "./index";
