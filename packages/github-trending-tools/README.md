<p align="center">
  <a href="https://github.com" target="_blank" rel="noopener noreferrer">
    <img width="64" src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub logo">
  </a>
</p>
<h1 align="center">
  GitHub Trending Scraper
</h1>
<h3 align="center">
  Track what's trending across programming languages
</h3>
<p align="center">
  A lightweight TypeScript tool that scrapes GitHub trending repositories<br />
  and generates clean markdown reports for daily tracking.
</p>

<p align="center">
  <sub><em>This project is not affiliated with or endorsed by GitHub.</em></sub>
</p>

<br/>

## Quick Start

```bash
# install deps
npm install

# generate
npm start
```

## Features

- **700+ Languages Supported** — All languages available on GitHub trending
- **Default Configuration** — Pre-configured with 19 popular languages (C, C++, CSS, Elixir, Go, Haskell, HTML, Java, JavaScript, Kotlin, Lua, OCaml, Python, Rust, Shell, Svelte, TypeScript, Vue, Zig)
- **Fully Customizable** — Easy to add or remove languages from the scraping list
- **Retry Logic** — Robust error handling with exponential backoff
- **Clean Output** — Beautiful markdown tables with repository metrics
- **Zero Configuration** — Works out of the box with sensible defaults

## Sample Output

| # | Repository | Description | Stars | Forks | Today |
| --- | --- | --- | --- | --- | --- |
| 1 | [torvalds/linux](https://github.com/torvalds/linux) | Linux kernel source tree | 195,104 | 56,151 | 93 stars today |
| 2 | [jemalloc/jemalloc](https://github.com/jemalloc/jemalloc) | No description | 10,184 | 1,505 | 59 stars today |
| 3 | [google/security-research](https://github.com/google/security-research) | This project hosts security advisories and their accompanying proof-of-concepts related to resear... | 4,031 | 474 | 13 stars today |

## License

Licensed under the [MIT License](./LICENSE).
