/**
 * Tests for URL checking utilities.
 */

import { assertEquals } from "@std/assert"
import { extractManifestUrls } from "./url_checker.ts"

Deno.test("extractManifestUrls - extracts source URL", () => {
  const manifest = {
    source: {
      url: "https://example.com/mod.zip",
    },
  }

  const urls = extractManifestUrls(manifest)
  assertEquals(urls, ["https://example.com/mod.zip"])
})

Deno.test("extractManifestUrls - extracts icon URL", () => {
  const manifest = {
    source: {
      url: "https://example.com/mod.zip",
    },
    iconUrl: "https://example.com/icon.png",
  }

  const urls = extractManifestUrls(manifest)
  assertEquals(urls.length, 2)
  assertEquals(urls.includes("https://example.com/mod.zip"), true)
  assertEquals(urls.includes("https://example.com/icon.png"), true)
})

Deno.test("extractManifestUrls - handles missing fields", () => {
  const manifest = {}
  const urls = extractManifestUrls(manifest)
  assertEquals(urls, [])
})

// Note: checkUrl tests would require network access or mocking
// In a real project, you might use a mocking library
