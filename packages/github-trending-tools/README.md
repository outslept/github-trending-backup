# github-trending-tools

Track what's hot. 700+ languages.

## How it works

```bash
npm start
# scrapes 19 popular languages
# generates markdown with tables
# saves to fs
# done
```

## Output sample

```markdown
## TypeScript

| # | Repository | Description | Stars | Forks | Today |
|---|------------|-------------|-------|-------|-------|
| 1 | microsoft/vscode | Visual Studio Code | 162,127 | 28,513 | 89 |
| 2 | angular/angular | The modern web developer's platform | 95,234 | 25,012 | 45 |
```

## Languages included as a default

C • C++ • CSS • Elixir • Go • Haskell • HTML • Java • JavaScript • Kotlin • Lua • OCaml • Python • Rust • Shell • Svelte • TypeScript • Vue • Zig

## Customization

Want different languages? Edit the list:

```typescript
const languages: GitHubLanguage[] = [
  "JavaScript",
  "Python",
  "Rust",
  // add whatever you want
];
```

700+ languages supported. Full list in `constant.ts`.

## Development

```bash
cd github-trending-tools
npm install
npm start
```

## Disclaimer

Not affiliated with GitHub. Use responsibly.
