# ROZEE.PK URL Reference

Investigated 2026-10-25. Public pages, no login. `robots.txt` disallows `/rozee-a/`, `/rozee-b/`,
`/page/`, `/hiring/`, `/people/`, `/UR/`, `/ZH/` and a few staging paths - **not** `/job/jsearch/`
or job permalinks. The terms (`/site/termsConditions`) contain no clause on automated access.
The honest `Mozilla/5.0 (compatible; rozee-cli/1.0)` User-Agent gets HTTP 200.

## Search

```
https://www.rozee.pk/job/jsearch/q/<url-encoded keywords>[/fc/<cityID>][/fpn/<offset>]
```

| Segment | Meaning | Notes |
|---------|---------|-------|
| `q/<text>` | Keywords | Required. A numeric job id as the query returns that job (used by `detail <id>`). |
| `fc/<cityID>` | City filter | IDs below. `international` is a valid ID. |
| `fpn/<offset>` | Result offset | 0, 20, 40, ... (20 per page). Omit for page 1. |

Other facet keys seen in the response (not wired into the CLI): `fjt` job title, `fe` experience,
`fsi` shift, `fsl` skill, `fin` industry, `fg` gender, `fcn` company. There is **no posting-age
or workplace-type (remote) parameter**.

### Response structure

The HTML page contains an inline script with:

```js
var apResp = {"response": { ... }, "code": 200};
```

Read the object literal by brace matching (string-aware) from the `{` after `var apResp = `,
then `JSON.parse`. Under `response`:

| Path | Content |
|------|---------|
| `numFound` | Total matches for the query |
| `jobs.sponsored[]`, `jobs.basic[]` | Result hits (sponsored first; can overlap with basic) |
| `cities[]` | Full city list: `{city, cityID}` (~576 entries) |
| `pagination.list[]` | `{type, lang, fpn}` page links |
| `facets[]` | `{meta: {fkey, blkTitle}, data: [...]}` |

Per-hit fields used:

| Field | Maps to |
|-------|---------|
| `jid` | `id` |
| `title` | `title` |
| `company_name` (+ `hideCompany` = `"Y"` means confidential) | `company` |
| `city` | `location` (`All Cities` for multi-city/remote) |
| `created_at` (ISO) | `date` (YYYY-MM-DD) |
| `rozeePermaLink` / `permaLink` | `url` = `https://www.rozee.pk/<permalink>` |
| `applyBy` (ISO) | `deadline` |
| `experience_text` | `experience` |
| `type` | `shift` (e.g. "First Shift (Day)") |
| `salaryN_exact`, `salaryT_exact`, `currency_unit` | `salary` - keys absent when unpublished |
| `skills[]` | `skills` |

### Main city IDs

| City | ID | City | ID |
|------|----|------|----|
| Islamabad | 1180 | Multan | 1187 |
| Faisalabad | 1181 | Peshawar | 1188 |
| Gujranwala | 1182 | Quetta | 1189 |
| Hyderabad | 1183 | Rawalpindi | 1190 |
| Karachi | 1184 | Sialkot | 1192 |
| Lahore | 1185 | International | international |

## Detail

```
https://www.rozee.pk/<permalink>     e.g. /mern-stack-developer-lahore-jobs-1922975
```

The id alone is not addressable: `/job-<id>`, `/jobs-<id>` and wrong slugs 302 to
`/site/error?e=cnf_...` (treated as not found). Resolve a bare id via a search with `q/<id>`.

The page carries a schema.org block:

```html
<script type="application/ld+json">{"@type":"JobPosting", ...}</script>
```

| Field | Content |
|-------|---------|
| `title` | Job title |
| `hiringOrganization.name` | Employer |
| `jobLocation.address.addressLocality` | City |
| `datePosted` | YYYY-MM-DD |
| `validThrough` | Deadline (ISO with +05:00) |
| `employmentType[]` | Often `["OTHER"]` |
| `description` | HTML (`<br>`, `<b>`) - convert to text keeping line breaks |
