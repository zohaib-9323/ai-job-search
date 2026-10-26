# rozee-cli

CLI for searching jobs on **ROZEE.PK**, Pakistan's largest job portal.

**Data source**: the JSON embedded in ROZEE.PK's public search pages (`/job/jsearch/q/...`) and the
JobPosting JSON-LD on job pages. See `../url-reference.md`.
**Authentication**: None required.
**Dependencies**: None (plain `bun` + `fetch`). `bun install` is optional and only pulls dev type defs.

> **Personal use only.** Keep volume low and don't use it commercially or for bulk data collection.

## Installation

```bash
cd .agents/skills/rozee-search/cli
bun install   # optional - only installs TypeScript dev types
```

## Commands

| Command | Description |
|---------|-------------|
| `search` | Search for job listings (`--query` required) |
| `detail` | Fetch full detail for a single job listing |

`search` accepts `--format json|table|plain` (default `json`); `detail` accepts `--format json|plain`.
All errors are written to **stderr** as `{ "error": "...", "code": "..." }` with exit code `1`.

## Quick examples

```bash
bun run src/cli.ts search -q "MERN Stack Developer" -l Lahore --format table
bun run src/cli.ts search -q "remote full stack developer" --format table
bun run src/cli.ts detail 1922975 --format plain
```

## Tests

```bash
bun run test        # parsing unit tests + a few live requests to rozee.pk
bun run typecheck
```
