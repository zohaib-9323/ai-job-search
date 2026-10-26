# Search Queries for Job Scraper


## Installed portal CLIs (primary for `/scrape`)

`/scrape` discovers every portal skill under `.agents/skills/*/SKILL.md` and runs its CLI first. Shipped country-agnostic CLIs include `linkedin-search` and `freehire-search`; Danish demos and any skill you add with `/add-portal` are included the same way. You do **not** need a matching `site:` line below for those CLIs to run.

The `site:` query templates in this file are the **WebSearch fallback** — for portals without a CLI, company career pages, or when a CLI fails.

**Language scope:** write every query category in every language listed in your CLAUDE.md Languages table (typically 1-2, sometimes more). A posting requiring a language you have *not* declared, as a job condition, is excluded before scoring; a posting requiring a *higher level* than you declared in a language you *do* work in is flagged for your own judgment, not excluded — see `04-job-evaluation.md`'s Language Gate, the single source of truth for this rule. Translate each category's keywords rather than machine-translating word-for-word (e.g. "Frontend Developer" -> "Desarrollador Frontend", not a literal word-for-word translation) if you work in more than one language.

## Search Sites

Primary:
- **linkedin.com/jobs** - LinkedIn listings, filter Pakistan / Lahore and "Remote"; also covered by the `linkedin-search` CLI
- **freehire** - covered by the `freehire-search` CLI
- **rozee.pk** - Pakistan's largest job board; covered by the `rozee-search` CLI (use `-l Lahore`, or put `remote` in the query). The `site:rozee.pk` queries below are the fallback if the CLI fails
- **pk.indeed.com** - Indeed Pakistan (WebSearch fallback)

Remote-first boards (WebSearch fallback):
- **weworkremotely.com**, **remoteok.com**, **wellfound.com** (AngelList), **arc.dev**, **turing.com/jobs**, **remote.co**

Secondary (company career pages via Google):
- Direct Google searches with `site:` filters for target companies, when any are added

## Query Categories

Queries are grouped by priority. The candidate works in English (fluent) and Urdu (native); Pakistani and international tech postings are almost always in English, so English queries cover the market. Every query is run twice where the site supports it: once for **Lahore** and once for **Remote**.

### Priority 1: Full-stack JavaScript product engineering (MERN / Next.js)

The strongest and most desired direction.

```
site:linkedin.com/jobs "MERN Stack Developer" Lahore
site:linkedin.com/jobs "Full Stack Developer" React Node.js Remote
site:linkedin.com/jobs "Full Stack Engineer" Next.js Remote
site:rozee.pk "MERN Stack Developer" Lahore
site:rozee.pk "Full Stack Developer" Lahore
site:pk.indeed.com "MERN Stack" Lahore
site:weworkremotely.com "Full Stack" React Node
site:remoteok.com "full stack" node react
```

### Priority 2: AI / LLM application engineering

Domain expertise: RAG, LLM integrations, AI features in SaaS.

```
site:linkedin.com/jobs "AI Engineer" Node.js OR TypeScript Remote
site:linkedin.com/jobs "AI Engineer" Lahore
site:linkedin.com/jobs "LLM Engineer" OR "GenAI Engineer" Remote
site:linkedin.com/jobs "AI Full Stack" Developer Remote
site:linkedin.com/jobs "AI Integration Engineer" Remote
site:rozee.pk "AI Engineer" Lahore
site:wellfound.com "AI Engineer" TypeScript remote
site:arc.dev "AI Engineer" remote
```

### Priority 3: Adjacent roles

Backend-focused, frontend-focused and client-facing variants of the same skill set.

```
site:linkedin.com/jobs "Backend Engineer" NestJS OR Node.js Remote
site:linkedin.com/jobs "Node.js Developer" Lahore
site:linkedin.com/jobs "Next.js Developer" Remote
site:linkedin.com/jobs "Forward Deployed Engineer" Remote
site:linkedin.com/jobs "Solutions Engineer" "AI" Remote
site:rozee.pk "Node.js Developer" Lahore
site:rozee.pk "React Developer" Lahore
```

### Priority 4: Broader JavaScript / TypeScript roles

Wider net.

```
site:linkedin.com/jobs "Software Engineer" TypeScript Lahore
site:linkedin.com/jobs "JavaScript Developer" Remote
site:turing.com/jobs "Full Stack" Node React
site:pk.indeed.com "Software Engineer" Node Lahore
site:remote.co "full stack developer"
```

## Location Filter

Home base: Lahore, Punjab, Pakistan. Any time zone is acceptable for remote work.
- **Ideal:** Fully remote (worldwide or Pakistan-inclusive, any time zone); on-site/hybrid in Lahore (incl. Gulberg, DHA, Johar Town, Model Town, Arfa Software Technology Park)
- **Acceptable:** Remote roles restricted to "Asia", "EMEA", "Pakistan" or "APAC" time zones - check the posting allows Pakistan
- **Borderline:** "Remote" with occasional travel to an office outside Lahore - FLAG for the user
- **Too far (exclude):** On-site or hybrid anywhere outside Lahore (Karachi, Islamabad, Rawalpindi, abroad); remote roles limited to residents of another country ("US only", "EU only", "must be based in UK")

## Salary Filter

If a posting states pay, exclude it when it is below **PKR 75,000/month** (local) or **USD 400/month** (remote). If no pay is stated, include it.

## Language Filter

Your working languages and levels are in CLAUDE.md's Languages table. When filtering scraped results, apply `04-job-evaluation.md`'s Language Gate: a posting requiring a language you haven't declared at all is excluded; a posting requiring a higher level than you declared in a language you do work in is not excluded, flag it clearly instead (see `job-scraper/SKILL.md`'s Step 3 "Quick Fit Assessment" for how the flag surfaces in `/scrape` output). Postings simply *written* in a language you don't work in, that don't require it on the job, are fine.

## Date Filter

Only include jobs posted within the last 14 days, or with an application deadline that has not yet passed. If a posting date cannot be determined, include it but flag as "date unknown".

## Adapting Queries

If the user specifies a focus area, select queries from the matching category and also generate 2-3 custom queries for that focus. For example:
- "/scrape [focus_area]" -> relevant category queries + custom focus-specific queries
