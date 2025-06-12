import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import { formatToMarkdown } from "./src/formatter";
import { scrapeLanguages, type GitHubLanguage } from "./src/scraper";

const LANGUAGES: GitHubLanguage[] = [
  "C",
  "C++",
  "CSS",
  "Elixir",
  "Go",
  "Haskell",
  "HTML",
  "Java",
  "JavaScript",
  "Kotlin",
  "Lua",
  "OCaml",
  "Python",
  "Rust",
  "Shell",
  "Svelte",
  "TypeScript",
  "Vue",
  "Zig",
];

function findProjectRoot(path: string = process.cwd()): string {
  return existsSync(join(path, ".git")) ? path : findProjectRoot(dirname(path));
}

function getOutputPath(date: string): string {
  const projectRoot = findProjectRoot();
  const year = date.slice(0, 4);
  const month = date.slice(5, 7);

  const outputDir = join(projectRoot, "data", year, month);

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  return join(outputDir, `${date}.md`);
}

const CONFIG = {
  concurrency: 3,
  maxRetries: 3,
  baseDelay: 2000,
  maxDelay: 10000,
};

async function main() {
  const date = new Date().toISOString().slice(0, 10);

  const results = await scrapeLanguages(LANGUAGES, CONFIG);
  const markdown = formatToMarkdown(results, date);

  const outputPath = getOutputPath(date);
  writeFileSync(outputPath, markdown, "utf8");

  // eslint-disable-next-line no-console
  console.log(`Report saved to: ${outputPath}`);

  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    const failedLanguages = failed.map((r) => r.language).join(", ");
    console.error(`Failed languages: ${failedLanguages}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
