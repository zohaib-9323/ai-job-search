import { htmlFetch, jobUrl, parseJobDetail, parseSearchPage, writeError } from "../helpers.js"
import { buildUrl } from "./search.js"

export interface DetailOpts {
  id: string
  format: "json" | "plain"
}

const ROZEE_HOST = /(^|\.)rozee\.pk$/i

/**
 * Accept a numeric job id, a rozee.pk job URL (with or without scheme), or a
 * bare permalink slug ending in "-jobs-<id>". Returns the id plus the
 * permalink when the input already carries one. URLs on any other host are
 * rejected rather than mined for digits.
 */
export function normalizeInput(input: string): { id: string; permalink: string | null } | null {
  const trimmed = input.trim()
  if (/^\d{5,}$/.test(trimmed)) return { id: trimmed, permalink: null }

  const hasScheme = /^https?:\/\//i.test(trimmed)
  if (hasScheme || /^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(trimmed)) {
    let parsed: URL
    try {
      parsed = new URL(hasScheme ? trimmed : `https://${trimmed}`)
    } catch {
      return null
    }
    if (!ROZEE_HOST.test(parsed.hostname)) return null
    const m = parsed.pathname.match(/^\/([a-z0-9-]*-jobs-(\d{5,}))\/?$/i)
    return m ? { id: m[2], permalink: m[1] } : null
  }

  const slug = trimmed.match(/^([a-z0-9-]*-jobs-(\d{5,}))$/i)
  return slug ? { id: slug[2], permalink: slug[1] } : null
}

/** A bare id has no slug; Rozee's keyword search matches the job id and returns its permalink. */
async function permalinkForId(id: string): Promise<string | null> {
  const html = await htmlFetch(buildUrl(id, null, 1))
  const parsed = html ? parseSearchPage(html) : null
  const hit = parsed?.cards.find((c) => c.id === id)
  return hit ? hit.url : null
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  const input = normalizeInput(opts.id)
  if (!input) {
    writeError(`Could not parse a Rozee job id or URL from "${opts.id}"`, "BAD_ID")
    return 1
  }
  try {
    const url = input.permalink ? jobUrl(input.permalink) : await permalinkForId(input.id)
    if (!url) {
      writeError(`Job ${input.id} not found (it may have expired)`, "NOT_FOUND")
      return 1
    }
    const html = await htmlFetch(url)
    if (!html) {
      writeError("Job not found (it may have expired)", "NOT_FOUND")
      return 1
    }
    const job = parseJobDetail(html, input.id, url)
    if (!job) {
      writeError("Job page did not contain a JobPosting block - the markup may have changed", "PARSE_FAILED")
      return 1
    }

    if (opts.format === "plain") {
      const lines = [
        job.title,
        `${job.company || "—"} · ${job.location || "—"}`,
        "",
        job.date ? `Posted: ${job.date}` : "",
        job.deadline ? `Apply by: ${job.deadline}` : "",
        job.employmentType ? `Employment: ${job.employmentType}` : "",
        `Status: ${job.isActive ? "ACTIVE" : "CLOSED / EXPIRED"}`,
        "",
        job.description || "(no description)",
        "",
        `URL: ${job.url}`,
      ].filter((l) => l !== "")
      process.stdout.write(lines.join("\n") + "\n")
    } else {
      process.stdout.write(JSON.stringify(job, null, 2) + "\n")
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "DETAIL_FAILED")
    return 1
  }
}
