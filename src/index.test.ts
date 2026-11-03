// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { createImeTracker, imeSafe, isImeComposing } from "./index";
import { browsers, composeAndPress, pressKey } from "./testing";

function setup(withTracker = false) {
  const el = document.createElement("textarea");
  document.body.append(el);
  const send = vi.fn();
  const close = vi.fn();
  const tracker = withTracker ? createImeTracker(el) : undefined;
  el.addEventListener(
    "keydown",
    imeSafe((e: KeyboardEvent) => {
      if (e.key === "Enter") send();
      if (e.key === "Escape") close();
    }, tracker),
  );
  return { el, send, close };
}

describe.each(browsers)("%s", (browser) => {
  it("does not send when Enter confirms a candidate", () => {
    const { el, send } = setup();
    composeAndPress(el, { browser });
    expect(send).not.toHaveBeenCalled();
    pressKey(el);
    expect(send).toHaveBeenCalledTimes(1);
  });
  it("does not close when Escape cancels a candidate", () => {
    const { el, close } = setup();
    composeAndPress(el, { browser, key: "Escape" });
    expect(close).not.toHaveBeenCalled();
    pressKey(el, "Escape");
    expect(close).toHaveBeenCalledTimes(1);
  });
});

describe("tracker", () => {
  it("catches a real keyCode right after compositionend", async () => {
    const { el, send } = setup(true);
    el.dispatchEvent(new CompositionEvent("compositionstart"));
    el.dispatchEvent(new CompositionEvent("compositionend"));
    pressKey(el); // same task: still treated as IME
    expect(send).not.toHaveBeenCalled();
    await new Promise((r) => setTimeout(r, 0));
    pressKey(el);
    expect(send).toHaveBeenCalledTimes(1);
  });
});

describe("isImeComposing", () => {
  it("reads React-style nativeEvent", () => {
    expect(isImeComposing({ nativeEvent: { isComposing: true } })).toBe(true);
    expect(isImeComposing({ nativeEvent: { keyCode: 229 } })).toBe(true);
    expect(isImeComposing({ nativeEvent: { keyCode: 13 } })).toBe(false);
  });
});

describe("the bug this fixes", () => {
  it("an unguarded handler sends half-typed text", () => {
    const el = document.createElement("input");
    const send = vi.fn();
    // eslint-disable-next-line ime-safe-form/require-ime-safe-submit
    el.addEventListener("keydown", (e) => e.key === "Enter" && send());
    composeAndPress(el, { browser: "chrome" });
    expect(send).toHaveBeenCalled();
  });
});
