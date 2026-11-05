# github-trending-tools

Track what's hot. 700+ languages.

## How it works

```bash
pnpm start
# scrapes 19 popular languages
# saves monthly JSON snapshots to data/YYYY/YYYY-MM.json
# updates data/metadata.json
# done
```

## Output sample

```json
{
  "month": "2025-02",
  "days": {
    "24": [
      {
        "language": "TypeScript",
        "repos": [
          {
            "rank": 1,
            "repo": "microsoft/vscode",
            "desc": "Visual Studio Code",
            "stars": 162127,
            "forks": 28513,
            "today": 89
          }
        ]
      }
    ]
  }
}
```

## Languages included as a default

C • C++ • CSS • Elixir • Go • Haskell • HTML • Java • JavaScript • Kotlin • Lua • OCaml • Python • Rust • Shell • Svelte • TypeScript • Vue • Zig

## Customization

Want different languages? Edit `WATCHLIST` in [`src/index.ts`](./src/index.ts):

```typescript
const WATCHLIST: readonly GitHubLanguage[] = [
  'JavaScript',
  'Python',
  'Rust',
  // add whatever you want
];
```

700+ languages supported. Full list in [`src/github-languages.ts`](./src/github-languages.ts).

## Disclaimer

Not affiliated with GitHub. Use responsibly.
