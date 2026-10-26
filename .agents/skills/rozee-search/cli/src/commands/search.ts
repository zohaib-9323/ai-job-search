import {
  BASE_URL,
  SEARCH_PATH,
  PAGE_SIZE,
  KNOWN_CITY_IDS,
  htmlFetch,
  parseSearchPage,
  parseCityIds,
  writeError,
  type JobCard,
} from "../helpers.js"

export interface SearchOpts {
  query: string
  location?: string
  jobage?: number
  page: number
  limit?: number
  format: "json" | "table" | "plain"
}

/**
 * Build the path-style search URL: /job/jsearch/q/<query>[/fc/<cityID>][/fpn/<offset>].
 * `fpn` is a result offset (0, 20, 40...), not a page number.
 */
export function buildUrl(query: string, cityId: string | null, page: number): string {
  let url = `${BASE_URL}${SEARCH_PATH}/q/${encodeURIComponent(query)}`
  if (cityId) url += `/fc/${encodeURIComponent(cityId)}`
  const offset = (page - 1) * PAGE_SIZE
  if (offset > 0) url += `/fpn/${offset}`
  return url
}

/**
 * Resolve a city name (or a raw numeric cityID) to Rozee's cityID. Unknown
 * names cost one extra request: every search page carries the full city list.
 */
async function resolveCityId(location: string, query: string): Promise<string | null> {
  const key = location.trim().toLowerCase()
  if (/^\d+$/.test(key)) return key
  if (KNOWN_CITY_IDS[key]) return KNOWN_CITY_IDS[key]
  const html = await htmlFetch(buildUrl(query, null, 1))
  return parseCityIds(html).get(key) ?? null
}

function renderTable(cards: JobCard[]): string {
  if (cards.length === 0) return "No results."
  const rows = cards.map((c) => {
    const title = (c.title || "").slice(0, 40).padEnd(40)
    const company = (c.company || "—").slice(0, 26).padEnd(26)
    const loc = (c.location || "—").slice(0, 14).padEnd(14)
    const date = (c.date || "—").padEnd(10)
    const sal = c.salary ? `${c.salary.currency ?? ""} ${c.salary.min ?? "?"}-${c.salary.max ?? "?"}`.trim() : "—"
    return `${c.id.padEnd(8)} ${title} ${company} ${loc} ${date} ${sal}`
  })
  const header =
    "ID".padEnd(8) + " " + "TITLE".padEnd(40) + " " + "COMPANY".padEnd(26) + " " +
    "LOCATION".padEnd(14) + " " + "DATE".padEnd(10) + " SALARY"
  return [header, "-".repeat(header.length), ...rows].join("\n")
}

export async function runSearch(opts: SearchOpts): Promise<number> {
  try {
    let cityId: string | null = null
    if (opts.location) {
      cityId = await resolveCityId(opts.location, opts.query)
      if (!cityId) {
        writeError(
          `Unknown city "${opts.location}" - Rozee has no city by that name; for remote roles put "remote" in --query instead`,
          "BAD_LOCATION",
        )
        return 1
      }
    }

    const html = await htmlFetch(buildUrl(opts.query, cityId, opts.page))
    const parsed = html ? parseSearchPage(html) : null
    if (!parsed) {
      writeError("Search page did not contain the expected results data (apResp) - the markup may have changed", "PARSE_FAILED")
      return 1
    }

    let cards = parsed.cards
    // Rozee has no posting-age parameter, so --jobage filters the fetched page client-side.
    if (opts.jobage !== undefined) {
      const cutoff = new Date(Date.now() - opts.jobage * 86400000).toISOString().slice(0, 10)
      cards = cards.filter((c) => c.date === null || c.date >= cutoff)
    }
    if (opts.limit !== undefined) cards = cards.slice(0, opts.limit)

    if (opts.format === "table") {
      process.stdout.write(renderTable(cards) + "\n")
    } else if (opts.format === "plain") {
      process.stdout.write(
        cards
          .map(
            (c) =>
              `${c.title}\n  ${c.company || "—"} · ${c.location || "—"} · ${c.date || "—"}` +
              (c.deadline ? ` · apply by ${c.deadline}` : "") +
              `\n  id: ${c.id}\n  ${c.url}`,
          )
          .join("\n\n") + "\n",
      )
    } else {
      process.stdout.write(
        JSON.stringify(
          { meta: { count: cards.length, page: opts.page, total: parsed.total }, results: cards },
          null,
          2,
        ) + "\n",
      )
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "SEARCH_FAILED")
    return 1
  }
}
