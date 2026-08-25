# Github Trending Inspector

> A fast, modern archive browser for GitHub trending repositories.

<p>
  <a href="https://github.com/outslept/github-trending-backup">
    <img src="https://raw.githubusercontent.com/outslept/github-trending-backup/refs/heads/master/.github/preview.jpg" alt="Github Trending Inspector preview">
  </a>
</p>

## Features

Browse trending repositories for any available date using a visual calendar, direct date input, or jump straight to the most recent day via `/latest`. The app features a "Top Today" overview, a sidebar table of contents for quick navigation between languages, and local history tracking of your previously visited dates.

Data tables are fully responsive, offering comprehensive views on desktop and clean card layouts on mobile. You can search across repository names and descriptions in real-time, and sort by rank, stars, forks, or daily growth. Language icons provide quick visual context, and all entries link directly to their original GitHub repositories.

### URL structure

| Pattern   | Example                  | Description                                                 |
| --------- | ------------------------ | ----------------------------------------------------------- |
| `/:date`  | `/2026-08-20`            | View trending repositories for a specific date.             |
| `/latest` | `/latest`                | Redirects to the most recent date available in the archive. |
| `/#slug`  | `/2026-08-20#typescript` | Auto-scrolls to a specific language section on the page.    |

## Data Source

The data is scraped daily using a dedicated tool and stored as static JSON files. The scraper captures 19 popular languages daily, organized by year and month in the `/data` directory.
