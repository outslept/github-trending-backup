interface Repository {
  rank: number;
  title: string;
  url: string;
  description: string;
  stars: string;
  forks: string;
  todayStars: string;
}

interface ScrapingResult {
  language: string;
  repositories: Repository[];
  success: boolean;
  error?: string;
}

function createAnchor(text: string): string {
  // eslint-disable-next-line unicorn/prefer-string-replace-all
  return text.toLowerCase().replace(/\W/g, "-");
}

function formatTableRow(repo: Repository): string {
  const description =
    repo.description.length > 100
      ? `${repo.description.slice(0, 97)}...`
      : repo.description;

  return `| ${repo.rank} | [${repo.title}](${repo.url}) | ${description} | ${repo.stars} | ${repo.forks} | ${repo.todayStars} |`;
}

function formatSection(result: ScrapingResult): string {
  if (!result.success) {
    return `## ${result.language}\n\nFailed to scrape: ${result.error || "Unknown error"}\n`;
  }

  if (result.repositories.length === 0) {
    return `## ${result.language}\n\nNo trending repositories found.\n`;
  }

  const header = `## ${result.language}\n`;
  const tableHeader =
    "| # | Repository | Description | Stars | Forks | Today |\n| --- | --- | --- | --- | --- | --- |";
  const rows = result.repositories.map(formatTableRow).join("\n");

  return `${header}\n${tableHeader}\n${rows}\n`;
}

export function formatToMarkdown(
  results: ScrapingResult[],
  date: string,
): string {
  const toc = results
    .map((r) => `- [${r.language}](#${createAnchor(r.language)})`)
    .join("\n");

  const sections = results.map(formatSection).join("\n");

  return `# GitHub Trending - ${date}\n\n## Table of Contents\n\n${toc}\n\n${sections}`;
}
