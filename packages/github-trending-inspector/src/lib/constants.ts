export const languageIcons: Record<string, string> = {
  bash: "/icons/bash.svg",
  shell: "/icons/bash.svg",
  c: "/icons/c.svg",
  "c++": "/icons/cpp.svg",
  css: "/icons/css.svg",
  elixir: "/icons/elixir.svg",
  go: "/icons/go.svg",
  haskell: "/icons/haskell.svg",
  html: "/icons/html.svg",
  java: "/icons/java.svg",
  javascript: "/icons/javascript.svg",
  kotlin: "/icons/kotlin.svg",
  lua: "/icons/lua.svg",
  ocaml: "/icons/ocaml.svg",
  python: "/icons/python.svg",
  rust: "/icons/rust.svg",
  svelte: "/icons/svelte.svg",
  typescript: "/icons/typescript.svg",
  vue: "/icons/vue.svg",
  zig: "/icons/zig.svg",
};

export const API_BASE_URL = import.meta.env.PROD
  ? `/api`
  : "http://localhost:3001/api";
