/**
 * Replay the event sequences real browsers emit when a user confirms an IME
 * candidate with a key. Use with jsdom/happy-dom or a real browser.
 */
export type Browser = "chrome" | "firefox" | "safari";

export interface ImeOptions {
  browser?: Browser;
  /** Text the candidate window commits. */
  text?: string;
  /** Key used to confirm (Enter) or cancel (Escape) the candidate. */
  key?: "Enter" | "Escape" | " ";
}

const codeOf = (key: string) => (key === "Enter" ? 13 : key === "Escape" ? 27 : 32);

function keydown(el: EventTarget, key: string, isComposing: boolean, keyCode: number) {
  const ev = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, isComposing });
  Object.defineProperty(ev, "keyCode", { get: () => keyCode });
  Object.defineProperty(ev, "which", { get: () => keyCode });
  el.dispatchEvent(ev);
}

function composition(el: EventTarget, type: string, data: string) {
  el.dispatchEvent(new CompositionEvent(type, { data, bubbles: true }));
}

/** Simulate: start composing, type, then confirm/cancel with `key`. */
export function composeAndPress(el: EventTarget, opts: ImeOptions = {}): void {
  const { browser = "chrome", text = "你好", key = "Enter" } = opts;
  composition(el, "compositionstart", "");
  keydown(el, "n", true, 229);
  composition(el, "compositionupdate", "n");
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.value += text;
  if (browser === "safari") {
    // Safari: compositionend first, then keydown with isComposing=false, keyCode=229.
    composition(el, "compositionend", text);
    keydown(el, key, false, 229);
  } else {
    keydown(el, key, true, browser === "firefox" ? codeOf(key) : 229);
    composition(el, "compositionend", text);
  }
}

/** A plain key press with no IME involved. */
export function pressKey(el: EventTarget, key: "Enter" | "Escape" | " " = "Enter"): void {
  keydown(el, key, false, codeOf(key));
}

export const browsers: Browser[] = ["chrome", "firefox", "safari"];
