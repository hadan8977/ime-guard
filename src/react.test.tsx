// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
afterEach(cleanup);
import { useImeGuard } from "./react";
import { browsers, composeAndPress, pressKey } from "./testing";

function Chat({ onSend }: { onSend: () => void }) {
  const { isImeComposing, onCompositionStart, onCompositionEnd } = useImeGuard();
  return (
    <textarea
      aria-label="msg"
      onCompositionStart={onCompositionStart}
      onCompositionEnd={onCompositionEnd}
      onKeyDown={(e) => {
        if (isImeComposing(e)) return;
        if (e.key === "Enter") onSend();
      }}
    />
  );
}

describe.each(browsers)("useImeGuard (%s)", (browser) => {
  it("sends only on a real Enter", () => {
    const onSend = vi.fn();
    const { getByLabelText } = render(<Chat onSend={onSend} />);
    const el = getByLabelText("msg");
    composeAndPress(el, { browser });
    expect(onSend).not.toHaveBeenCalled();
    return new Promise<void>((r) =>
      setTimeout(() => {
        pressKey(el);
        expect(onSend).toHaveBeenCalledTimes(1);
        r();
      }, 0),
    );
  });
});
