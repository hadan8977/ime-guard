# ime-guard

[English](./README.md) | **中文**

别让你的聊天框把打了一半的拼音发出去。

```
用户打 "jiudian"，候选框出现「酒店」，按 Enter 选词。
❌ 你的应用：把 "jiudian" 发给了 bot。
✅ 用了 ime-guard：选中「酒店」，再按一次 Enter 才发送。
```

<!-- GIF 位：拼音输入法下聊天框修复前后对比 -->

按 Escape 关候选框也一样，会把整个弹窗关掉。大多数开发者不用输入法，所以几乎每个 AI 聊天应用都有这个毛病。
OpenMausBot 里的真实修复：[#3788](https://github.com/milind-soni/OpenMausBot/pull/3788)（新建频道）、
[#4126](https://github.com/milind-soni/OpenMausBot/pull/4126)（新建自动化）、
[#4230](https://github.com/milind-soni/OpenMausBot/pull/4230)（命令面板）、
[#4357](https://github.com/milind-soni/OpenMausBot/pull/4357)（查找栏）。

## 安装

```sh
npm i github:hadan8977/ime-guard   # 还没发 npm
```

零依赖，核心很小，不挑框架。

## 用法

```ts
import { imeSafe } from "ime-guard";

input.addEventListener("keydown", imeSafe((e) => {
  if (e.key === "Enter") send();
  if (e.key === "Escape") close();
}));
```

只要判断：`if (isImeComposing(e)) return;`，DOM 事件和 React/Vue/Svelte 事件都能用。
React：`import { useImeGuard } from "ime-guard/react"`，示例见英文版。

## 为什么不只用 `e.isComposing`？

Safari 会先触发 `compositionend`，再触发确认选词的 `keydown`，这时 `isComposing` 已经是 `false`。
ime-guard 还会检查 `keyCode === 229`；可选的 tracker 会把 `compositionend` 后的同一个任务也当作还在组字。

## 测你自己的输入框

`ime-guard/testing` 按 Chrome、Firefox、Safari 的真实事件顺序回放组字过程：`composeAndPress(el, { browser, key })`、`pressKey(el)`。

## 代码检查

直接用 [eslint-plugin-ime-safe-form](https://github.com/hiroya-uga/eslint-plugin-ime-safe-form)，把 `isImeComposing` 加进 `guardFunctions`。

## 许可

MIT。写的时候用了 AI 助手，所有行为都有测试覆盖。
