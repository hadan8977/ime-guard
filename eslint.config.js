import tseslint from "typescript-eslint";
import imeSafe from "eslint-plugin-ime-safe-form";
export default [
  { ignores: ["dist", "node_modules"] },
  ...tseslint.configs.recommended,
  { ...imeSafe.configs.recommended, rules: { ...imeSafe.configs.recommended.rules }, settings: {} },
  { rules: { "ime-safe-form/require-ime-safe-submit": ["error", { guardFunctions: ["isImeComposing"] }], "ime-safe-form/require-ime-safe-key-events": ["error", { guardFunctions: ["isImeComposing"] }] } }
];
