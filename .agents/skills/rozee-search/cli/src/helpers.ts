// Data source: ROZEE.PK public search and job pages. No authentication required.
// The search page embeds its full result set as a JS object literal
// (`var apResp = {...}`), so we read that JSON instead of scraping the card
// markup. The detail page carries a schema.org JobPosting JSON-LD block.

export const BASE_URL = "https://www.rozee.pk"
export const SEARCH_PATH = "/job/jsearch"
/** Rozee renders a fixed 20 results per page; `fpn` is the result offset. */
export const PAGE_SIZE = 20

export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

const UA = "Mozilla/5.0 (compatible; rozee-cli/1.0)"

/**
 * Fetch HTML with exponential backoff on 429/5xx. Returns "" on a 404 and on
 * Rozee's not-found redirect (an unknown job slug 302s to /site/error).
 */
export async function htmlFetch(url: string): Promise<string> {
  const maxRetries = 6
  let delay = 500
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
    })
    if (response.status === 429 || response.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`)
      }
      const jitter = Math.floor(Math.random() * 500)
      await new Promise((r) => setTimeout(r, delay + jitter))
      delay = Math.min(delay * 2, 8000)
      continue
    }
    if (response.status === 404 || /\/site\/error/.test(response.url)) return ""
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`)
    }
    return response.text()
  }
  throw new Error("Request failed after max retries")
}

export interface Salary {
  min: number | null
  max: number | null
  currency: string | null
}

export interface JobCard {
  id: string
  title: string
  company: string | null
  location: string | null
  date: string | null
  url: string
  deadline: string | null
  experience: string | null
  shift: string | null
  salary: Salary | null
  skills: string[]
}

export interface JobDetail {
  id: string
  title: string
  company: string | null
  location: string | null
  date: string | null
  url: string
  deadline: string | null
  employmentType: string | null
  description: string | null
  isActive: boolean
}

/**
 * Return the JSON object literal that starts at `start` (which must point at
 * "{"), tracking string literals so braces inside descriptions don't count.
 */
export function extractJsonObject(src: string, start: number): string | null {
  if (src[start] !== "{") return null
  let depth = 0
  let inStr = false
  for (let i = start; i < src.length; i++) {
    const ch = src[i]
    if (inStr) {
      if (ch === "\\") i++
      else if (ch === '"') inStr = false
      continue
    }
    if (ch === '"') inStr = true
    else if (ch === "{") depth++
    else if (ch === "}") {
      depth--
      if (depth === 0) return src.slice(start, i + 1)
    }
  }
  return null
}

/** Pull the `apResp.response` object out of a search page. Null if absent. */
export function extractSearchResponse(html: string): Record<string, any> | null {
  const marker = html.indexOf("var apResp = ")
  if (marker === -1) return null
  const brace = html.indexOf("{", marker)
  const raw = extractJsonObject(html, brace)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed.response === "object" ? parsed.response : null
  } catch {
    return null
  }
}

function numericEntity(cp: number): string {
  return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : ""
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => numericEntity(parseInt(dec, 10)))
    .replace(/&#[xX]([0-9a-fA-F]+);/g, (_, hex) => numericEntity(parseInt(hex, 16)))
    .replace(/&nbsp;/g, " ")
    // Last, so "&amp;lt;" decodes to the literal "&lt;" rather than "<".
    .replace(/&amp;/g, "&")
}

function str(v: unknown): string | null {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s ? decodeHtmlEntities(s) : null
}

function positiveNumber(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Absolute job URL from a Rozee permalink slug. */
export function jobUrl(permalink: string): string {
  return `${BASE_URL}/${permalink.replace(/^\/+/, "")}`
}

/**
 * Map one raw search hit to a JobCard. Returns null for a hit missing the
 * fields we cannot invent (id, title, permalink).
 */
export function parseJob(raw: Record<string, any>): JobCard | null {
  const id = str(raw.jid)
  const title = str(raw.title)
  const permalink = str(raw.rozeePermaLink) ?? str(raw.permaLink)
  if (!id || !title || !permalink) return null

  const min = positiveNumber(raw.salaryN_exact)
  const max = positiveNumber(raw.salaryT_exact)
  const salary = min !== null || max !== null ? { min, max, currency: str(raw.currency_unit) } : null

  const created = str(raw.created_at)
  const applyBy = str(raw.applyBy)
  const city = Array.isArray(raw.city) ? raw.city.join(", ") : str(raw.city)

  return {
    id,
    title,
    // hideCompany = "Y" marks a confidential employer; Rozee then shows a placeholder.
    company: raw.hideCompany === "Y" ? null : str(raw.company_name),
    location: str(city),
    date: created ? created.slice(0, 10) : null,
    url: jobUrl(permalink),
    deadline: applyBy ? applyBy.slice(0, 10) : null,
    experience: str(raw.experience_text),
    shift: str(raw.type),
    salary,
    skills: Array.isArray(raw.skills) ? raw.skills.map((s: unknown) => String(s)) : [],
  }
}

/**
 * Parse a search page into cards. Sponsored and basic hits are merged
 * (sponsored first, de-duplicated by id) and each hit is parsed independently
 * so one malformed record cannot break the rest.
 */
export function parseSearchPage(html: string): { total: number | null; cards: JobCard[] } | null {
  const resp = extractSearchResponse(html)
  if (!resp) return null
  const jobs = resp.jobs ?? {}
  const rawHits: unknown[] = [
    ...(Array.isArray(jobs.sponsored) ? jobs.sponsored : []),
    ...(Array.isArray(jobs.basic) ? jobs.basic : []),
  ]
  const seen = new Set<string>()
  const cards: JobCard[] = []
  for (const hit of rawHits) {
    if (!hit || typeof hit !== "object") continue
    let card: JobCard | null = null
    try {
      card = parseJob(hit as Record<string, any>)
    } catch {
      card = null
    }
    if (!card || seen.has(card.id)) continue
    seen.add(card.id)
    cards.push(card)
  }
  const total = positiveNumber(resp.numFound) ?? (cards.length === 0 ? 0 : null)
  return { total, cards }
}

/** City name -> Rozee cityID, read from the `cities` list every search page carries. */
export function parseCityIds(html: string): Map<string, string> {
  const map = new Map<string, string>()
  const resp = extractSearchResponse(html)
  if (!resp || !Array.isArray(resp.cities)) return map
  for (const c of resp.cities) {
    if (c && typeof c.city === "string" && c.cityID !== undefined) {
      map.set(c.city.trim().toLowerCase(), String(c.cityID))
    }
  }
  return map
}

/**
 * The main cities, so a typical --location needs no lookup request. IDs read
 * from a live search page's `cities` list (2026-10-25); any other city is
 * resolved from that list at run time.
 */
export const KNOWN_CITY_IDS: Record<string, string> = {
  islamabad: "1180",
  faisalabad: "1181",
  gujranwala: "1182",
  hyderabad: "1183",
  karachi: "1184",
  lahore: "1185",
  multan: "1187",
  peshawar: "1188",
  quetta: "1189",
  rawalpindi: "1190",
  sialkot: "1192",
  international: "international",
}

/** Convert HTML description markup to text with paragraph breaks kept. */
export function htmlToText(html: string): string {
  const withBreaks = html
    .replace(/\r?\n/g, " ")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "\n- ")
    .replace(/<\/(p|li|ul|ol|div|h\d)>/gi, "\n")
  return withBreaks
    .split("\n")
    .map((line) => decodeHtmlEntities(line.replace(/<[^>]+>/g, " ")).replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/** Find the schema.org JobPosting JSON-LD block on a detail page. */
export function extractJobPosting(html: string): Record<string, any> | null {
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    let parsed: unknown
    try {
      parsed = JSON.parse(m[1].trim())
    } catch {
      continue
    }
    const candidates = Array.isArray(parsed) ? parsed : [parsed]
    for (const c of candidates) {
      if (c && typeof c === "object" && (c as any)["@type"] === "JobPosting") return c as Record<string, any>
    }
  }
  return null
}

/** Parse a detail page. Null when the page carries no JobPosting block. */
export function parseJobDetail(html: string, id: string, url: string): JobDetail | null {
  const jp = extractJobPosting(html)
  if (!jp) return null
  const addr = jp.jobLocation?.address ?? (Array.isArray(jp.jobLocation) ? jp.jobLocation[0]?.address : undefined)
  const validThrough = str(jp.validThrough)
  const deadline = validThrough ? validThrough.slice(0, 10) : null
  const employment = Array.isArray(jp.employmentType) ? jp.employmentType.join(", ") : str(jp.employmentType)
  const today = new Date().toISOString().slice(0, 10)
  return {
    id,
    title: str(jp.title) ?? "(untitled)",
    company: str(jp.hiringOrganization?.name),
    location: str(addr?.addressLocality),
    date: str(jp.datePosted),
    url,
    deadline,
    employmentType: employment,
    description: typeof jp.description === "string" ? htmlToText(jp.description) || null : null,
    // No deadline means no evidence either way; only a passed deadline marks it closed.
    isActive: deadline === null || deadline >= today,
  }
}
