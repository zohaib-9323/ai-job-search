---
name: rozee-search
version: 1.0.0
description: >
  Use this skill whenever the user wants to search for jobs in Pakistan on
  ROZEE.PK, Pakistan's largest job portal - Lahore, Karachi, Islamabad,
  Rawalpindi or any other Pakistani city, or remote roles listed for Pakistani
  candidates - or look up a specific rozee.pk job posting. Trigger phrases:
  find a job in Pakistan, jobs in Lahore, Rozee jobs, rozee.pk, search Rozee,
  vacancies in Karachi, hiring in Islamabad, Pakistani job openings, naukri,
  naukri ki talash, "are there any X jobs in Lahore".
context: fork
enabled: true  # set to false to keep this portal installed but have /scrape skip it
allowed-tools: Bash(bun run .agents/skills/rozee-search/cli/src/cli.ts *)
---

# Rozee Search Skill

Search live job listings on **ROZEE.PK** (Pakistan). No authentication, no API key, and
**zero runtime dependencies** - it runs with just `bun`.

## ⚠️ Personal use only

This reads ROZEE.PK's public search and job pages (robots.txt permits both paths, checked
2026-10-25). **Keep volume low** - a few searches per session, not a crawl - and don't use it
commercially or for bulk data collection. Run it on your own responsibility.

## When to use this skill

- Search for job openings in a Pakistani city, or remote roles posted on Rozee
- Get the full description, deadline and employer of a specific Rozee posting

## Commands

### Search job listings

```bash
bun run .agents/skills/rozee-search/cli/src/cli.ts search --query "<keywords>" [flags]
```

Key flags:
- `--query <text>` / `-q <text>` - **required.** Job title, skill or role. Rozee has no workplace-type filter: for remote roles, put `remote` in the query (`-q "remote full stack developer"`).
- `--location <city>` / `-l <city>` - a Pakistani city (`Lahore`, `Karachi`, `Islamabad`, `Rawalpindi`, ...). Main cities resolve instantly; any other city costs one extra lookup request. A raw Rozee cityID also works. Omit for all of Pakistan.
- `--jobage <days>` - keep postings from the last N days. **Client-side** filter on the fetched page (Rozee has no posting-age parameter); results already skew recent.
- `--page <n>` - page number (1-indexed, 20 results per page).
- `--limit <n>` / `-n <n>` - cap total results emitted (client-side).
- `--format json|table|plain` - default `json`.

### Fetch full job detail

```bash
bun run .agents/skills/rozee-search/cli/src/cli.ts detail <id|url> [--format json|plain]
```

`id` is the numeric job id from `search` results (e.g. `1922975`). A full rozee.pk job URL or
a permalink slug (`mern-stack-developer-lahore-jobs-1922975`) also works. A bare id costs one
extra request to look up its permalink. Returns title, company, location, posted date,
deadline (`Apply by`), employment type and the full description.

## Usage examples

```bash
# MERN roles in Lahore
bun run .agents/skills/rozee-search/cli/src/cli.ts search -q "MERN Stack Developer" -l Lahore --format table

# AI engineer roles in Lahore, last 14 days
bun run .agents/skills/rozee-search/cli/src/cli.ts search -q "AI Engineer" -l Lahore --jobage 14 --format table

# Remote full-stack roles anywhere in Pakistan
bun run .agents/skills/rozee-search/cli/src/cli.ts search -q "remote full stack developer" --format table

# Node.js backend roles in Islamabad, second page
bun run .agents/skills/rozee-search/cli/src/cli.ts search -q "Node.js Developer" -l Islamabad --page 2 --format table

# Full details for a specific job
bun run .agents/skills/rozee-search/cli/src/cli.ts detail 1922975 --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default - programmatic use, passing IDs to `detail` |
| `table` | Quick human-readable scanning (includes published salary) |
| `plain` | Reading a single job's full detail (`detail` command) |

Search results carry `id`, `title`, `company`, `location`, `date`, `url` plus Rozee extras:
`deadline`, `experience`, `shift`, `salary` (`{min, max, currency}` or `null`) and `skills`.
`meta.total` is Rozee's total match count for the query.

All errors are written to **stderr** as `{ "error": "...", "code": "..." }` and the process exits with code `1`.

## Notes

- Data comes from the `var apResp = {...}` JSON embedded in the search page and the
  schema.org `JobPosting` JSON-LD on job pages - see `url-reference.md`.
- `salary` is only present when the employer publishes it; `null` means unpublished, not unpaid.
- `company` is `null` for confidential postings.
- Remote and multi-city postings often show location `All Cities`.
- The `International` location filter returns mostly low-quality listings (e.g. salon staff
  in "Europa"); prefer `remote` in the query for remote work.
- Rozee's skill tags are noisy (auto-generated: "time-and-attendance", "particulate-matter");
  judge fit from the description, not the tags.
- Many postings list `employmentType: OTHER`; check the description for full-time / on-site details.
