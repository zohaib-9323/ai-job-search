// Live smoke tests against rozee.pk - a handful of requests, keep it that way.
import { describe, expect, test } from "bun:test"
import { runCLI, parseJSON } from "./helpers.ts"

interface SearchResult {
  meta: { count: number; page: number }
  results: { id: string; title: string; company: string | null; location: string | null; date: string | null; url: string }[]
}

describe("search (live)", () => {
  test("returns results with id, title and url", async () => {
    const out = parseJSON<SearchResult>(await runCLI(["search", "-q", "developer", "-l", "Lahore", "--limit", "5"]))
    expect(out.meta.page).toBe(1)
    expect(out.results.length).toBeGreaterThan(0)
    for (const r of out.results) {
      expect(r.id).toMatch(/^\d+$/)
      expect(r.title.length).toBeGreaterThan(0)
      expect(r.url).toStartWith("https://www.rozee.pk/")
      expect(r.location).toBe("Lahore")
    }
  })
})

describe("argument errors", () => {
  test("missing --query exits 1 with JSON on stderr", async () => {
    const res = await runCLI(["search", "-l", "Lahore"])
    expect(res.exitCode).toBe(1)
    expect(res.stdout).toBe("")
    expect(JSON.parse(res.stderr).code).toBe("NO_QUERY")
  })

  test("unknown flag exits 1", async () => {
    const res = await runCLI(["search", "-q", "developer", "--remote", "remote"])
    expect(res.exitCode).toBe(1)
    expect(JSON.parse(res.stderr).code).toBe("UNKNOWN_FLAG")
  })

  test("bad --page exits 1", async () => {
    const res = await runCLI(["search", "-q", "developer", "--page", "0"])
    expect(res.exitCode).toBe(1)
    expect(JSON.parse(res.stderr).code).toBe("BAD_ARG")
  })

  test("detail rejects a non-rozee URL", async () => {
    const res = await runCLI(["detail", "https://example.com/x-jobs-1922975"])
    expect(res.exitCode).toBe(1)
    expect(JSON.parse(res.stderr).code).toBe("BAD_ID")
  })
})
