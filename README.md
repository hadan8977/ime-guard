# ime-guard

**English** | [中文](./README.zh.md)

Stop your chat box from sending half-typed Chinese, Japanese or Korean.

```
User types "jiudian", the IME shows 酒店, user presses Enter to pick it.
❌ Your app: sends "jiudian" to the bot.
✅ With ime-guard: picks 酒店. The next Enter sends.
```

<!-- GIF placeholder: before/after recording of a chat box with Pinyin IME -->

Pressing Escape to close the candidate list has the same problem: it closes your whole dialog.
Most devs never type with an IME, so this bug ships in almost every AI chat app.
Real fixes in OpenMausBot: [#3788](https://github.com/milind-soni/OpenMausBot/pull/3788) (new channel dialog),
[#4126](https://github.com/milind-soni/OpenMausBot/pull/4126) (new automation input),
[#4230](https://github.com/milind-soni/OpenMausBot/pull/4230) (command palette).

## Install

```sh
npm i ime-guard   # not published yet — for now: npm i github:hadan8977/ime-guard
```

Zero dependencies. ~40 lines. Works with any framework.

## Use

```ts
import { imeSafe } from "ime-guard";

input.addEventListener("keydown", imeSafe((e) => {
  if (e.key === "Enter") send();
  if (e.key === "Escape") close();
}));
```

Or just the check:

```ts
import { isImeComposing } from "ime-guard";

function onKeyDown(e) {
  if (isImeComposing(e)) return; // works with DOM events and React/Vue/Svelte events
  if (e.key === "Enter") send();
}
```

### React

```tsx
import { useImeGuard } from "ime-guard/react";

const { isImeComposing, onCompositionStart, onCompositionEnd } = useImeGuard();
<textarea
  onCompositionStart={onCompositionStart}
  onCompositionEnd={onCompositionEnd}
  onKeyDown={(e) => { if (isImeComposing(e)) return; if (e.key === "Enter") send(); }}
/>
```

## Why not just `e.isComposing`?

Safari fires `compositionend` **before** the confirming `keydown`, so `isComposing` is already `false`.
`ime-guard` also checks `keyCode === 229`, and the optional tracker (`createImeTracker(el)` / `useImeGuard`)
treats the same task right after `compositionend` as still composing.

## Test your own input

`ime-guard/testing` replays what Chrome, Firefox and Safari actually emit:

```ts
import { browsers, composeAndPress, pressKey } from "ime-guard/testing";

for (const browser of browsers) {
  composeAndPress(textarea, { browser, key: "Enter" });
  expect(send).not.toHaveBeenCalled();
}
pressKey(textarea, "Enter");
expect(send).toHaveBeenCalledOnce();
```

Works in jsdom, happy-dom or a real browser. No dependency on ime-guard itself, so you can use it to test code that uses any guard.

## Catch it in lint

Use [eslint-plugin-ime-safe-form](https://github.com/hiroya-uga/eslint-plugin-ime-safe-form). It already does this well.
Tell it about our guard:

```js
rules: {
  "ime-safe-form/require-ime-safe-submit": ["error", { guardFunctions: ["isImeComposing"] }],
  "ime-safe-form/require-ime-safe-key-events": ["error", { guardFunctions: ["isImeComposing"] }],
}
```

## License

MIT. Written with help from an AI assistant; every behavior is covered by tests.
