/**
 * ime-guard: ignore Enter / Escape (or any key) while an IME is composing.
 *
 * Why three checks:
 * - `isComposing` is the standard flag (Chrome, Firefox, Edge).
 * - `keyCode === 229` covers Safari, where `compositionend` fires *before*
 *   the confirming keydown, so `isComposing` is already false.
 * - The optional tracker covers the rare case where a browser reports a real
 *   keyCode right after `compositionend` in the same task.
 */

type KeyLike = { isComposing?: boolean; keyCode?: number; which?: number };
type EventLike = KeyLike & { nativeEvent?: KeyLike };

const IME_KEYCODE = 229;

/** True if this keyboard event belongs to an IME composition and should be ignored. */
export function isImeComposing(event: EventLike, tracker?: ImeTracker): boolean {
  const n = event.nativeEvent ?? event;
  if (n.isComposing || event.isComposing) return true;
  if (n.keyCode === IME_KEYCODE || n.which === IME_KEYCODE) return true;
  return tracker ? tracker.composing() : false;
}

/** Wrap a keydown handler so it is skipped during IME composition. */
export function imeSafe<E extends EventLike>(
  handler: (event: E) => void,
  tracker?: ImeTracker,
): (event: E) => void {
  return (event) => {
    if (isImeComposing(event, tracker)) return;
    handler(event);
  };
}

export interface ImeTracker {
  /** True during composition and until the next task after it ends. */
  composing(): boolean;
  onCompositionStart(): void;
  onCompositionEnd(): void;
  /** Remove listeners when created with an element. */
  dispose(): void;
}

/** Track composition state. Pass an element to attach listeners, or call the handlers yourself. */
export function createImeTracker(target?: EventTarget): ImeTracker {
  let active = false;
  let justEnded = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const onCompositionStart = () => {
    active = true;
    justEnded = false;
  };
  const onCompositionEnd = () => {
    active = false;
    justEnded = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => (justEnded = false), 0);
  };
  target?.addEventListener("compositionstart", onCompositionStart);
  target?.addEventListener("compositionend", onCompositionEnd);
  return {
    composing: () => active || justEnded,
    onCompositionStart,
    onCompositionEnd,
    dispose() {
      target?.removeEventListener("compositionstart", onCompositionStart);
      target?.removeEventListener("compositionend", onCompositionEnd);
      if (timer) clearTimeout(timer);
    },
  };
}
