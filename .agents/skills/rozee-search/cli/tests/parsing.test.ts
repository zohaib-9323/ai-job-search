import { describe, expect, test } from "bun:test"
import { extractJsonObject, htmlToText, parseJobDetail, parseSearchPage } from "../src/helpers.ts"
import { buildUrl } from "../src/commands/search.ts"
import { normalizeInput } from "../src/commands/detail.ts"

const hit = (over: Record<string, unknown> = {}) => ({
  jid: "1922975",
  title: "Mern Stack Developer",
  company_name: "OPT Link Hub",
  hideCompany: "N",
  city: "Lahore",
  created_at: "2026-10-23T04:36:09Z",
  applyBy: "2026-10-28T00:00:00Z",
  rozeePermaLink: "mern-stack-developer-lahore-jobs-1922975",
  experience_text: "3 Years",
  type: "First Shift (Day)",
  currency_unit: "PKR",
  skills: ["MERN"],
  ...over,
})

const searchPage = (basic: unknown[], sponsored: unknown[] = []) =>
  `<html><script>var other = 1;\nvar apResp = ${JSON.stringify({
    response: { numFound: 444, cities: [{ city: "Lahore", cityID: "1185" }], jobs: { sponsored, basic } },
    code: 200,
  })};\nvar after = {"x": 1};</script></html>`

describe("parseSearchPage", () => {
  test("maps a hit to the contract fields", () => {
    const parsed = parseSearchPage(searchPage([hit()]))!
    expect(parsed.total).toBe(444)
    expect(parsed.cards[0]).toMatchObject({
      id: "1922975",
      title: "Mern Stack Developer",
      company: "OPT Link Hub",
      location: "Lahore",
      date: "2026-10-23",
      url: "https://www.rozee.pk/mern-stack-developer-lahore-jobs-1922975",
      deadline: "2026-10-28",
      salary: null,
    })
  })

  test("one malformed hit does not break the rest, and sponsored duplicates collapse", () => {
    const parsed = parseSearchPage(searchPage([null, { jid: "1" }, hit(), hit({ jid: "2", rozeePermaLink: "x-jobs-2" })], [hit()]))!
    expect(parsed.cards.map((c) => c.id)).toEqual(["1922975", "2"])
  })

  test("confidential employer becomes null and published salary is kept", () => {
    const parsed = parseSearchPage(searchPage([hit({ hideCompany: "Y", salaryN_exact: 80000, salaryT_exact: 120000 })]))!
    expect(parsed.cards[0].company).toBeNull()
    expect(parsed.cards[0].salary).toEqual({ min: 80000, max: 120000, currency: "PKR" })
  })

  test("braces inside strings do not end the object early", () => {
    const parsed = parseSearchPage(searchPage([hit({ title: 'Dev {"senior"} }' })]))!
    expect(parsed.cards[0].title).toBe('Dev {"senior"} }')
    expect(extractJsonObject('{"a":"}"}tail', 0)).toBe('{"a":"}"}')
  })

  test("a page without apResp returns null", () => {
    expect(parseSearchPage("<html>no data</html>")).toBeNull()
  })
})

describe("parseJobDetail", () => {
  test("reads the JobPosting JSON-LD block and keeps line breaks", () => {
    const ld = {
      "@type": "JobPosting",
      title: "Mern Stack Developer",
      datePosted: "2026-10-23",
      validThrough: "2000-01-01T00:00:00+05:00",
      employmentType: ["OTHER"],
      hiringOrganization: { name: "OPT Link Hub" },
      jobLocation: { address: { addressLocality: "Lahore" } },
      description: "Intro &amp; more.<br><br><b>Duties:</b><br>- Build APIs",
    }
    const html = `<script type="application/ld+json">${JSON.stringify(ld)}</script>`
    const job = parseJobDetail(html, "1922975", "https://www.rozee.pk/x-jobs-1922975")!
    expect(job.company).toBe("OPT Link Hub")
    expect(job.location).toBe("Lahore")
    expect(job.description).toBe("Intro & more.\n\nDuties:\n- Build APIs")
    expect(job.isActive).toBe(false)
  })

  test("htmlToText decodes entities once", () => {
    expect(htmlToText("a &amp;lt; b")).toBe("a &lt; b")
  })
})

describe("URL building and input parsing", () => {
  test("page and city map to path segments", () => {
    expect(buildUrl("mern stack", null, 1)).toBe("https://www.rozee.pk/job/jsearch/q/mern%20stack")
    expect(buildUrl("mern", "1185", 3)).toBe("https://www.rozee.pk/job/jsearch/q/mern/fc/1185/fpn/40")
  })

  test("detail input accepts id, rozee URL and slug, rejects other hosts", () => {
    expect(normalizeInput("1922975")).toEqual({ id: "1922975", permalink: null })
    expect(normalizeInput("https://www.rozee.pk/mern-stack-developer-lahore-jobs-1922975")).toEqual({
      id: "1922975",
      permalink: "mern-stack-developer-lahore-jobs-1922975",
    })
    expect(normalizeInput("mern-stack-developer-lahore-jobs-1922975")?.id).toBe("1922975")
    expect(normalizeInput("https://rozee.pk.evil.io/x-jobs-1922975")).toBeNull()
    expect(normalizeInput("https://boards.greenhouse.io/acme/jobs/1922975")).toBeNull()
  })
})
