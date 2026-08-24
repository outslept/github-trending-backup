# github-trending-data

Daily GitHub Trending data. 19 languages. Stored as JSON.

Generated automatically by [`github-trending-tools`](../github-trending-tools).

## Data

Data is organized by year and month:

```text
github-trending-data/
├── metadata.json
├── 2026/
│   ├── 2026-01.json
│   ├── 2026-02.json
│   └── ...
└── README.md
```

Each monthly file contains daily snapshots of GitHub Trending.

## Format

```json
{
  "month": "YYYY-MM",
  "days": {
    "DD": [
      {
        "language": "Foo",
        "repos": [
          {
            "rank": 1,
            "repo": "foo/bar",
            "desc": "foo bar",
            "stars": 123,
            "forks": 45,
            "today": 6
          }
        ]
      }
    ]
  }
}
```

Fields:

- `rank` — position on GitHub Trending
- `repo` — repository in `owner/name` format
- `desc` — repository description
- `stars` — total stars
- `forks` — total forks
- `today` — stars gained today

## Metadata

`metadata.json` provides an index of available snapshots:

```json
{
  "lastUpdated": "YYYY-MM-DD",
  "years": {
    "YYYY": {
      "MM": ["DD"]
    }
  }
}
```
