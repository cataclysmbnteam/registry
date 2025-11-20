/**
 * Tests for manifest schema.
 */

import { assertEquals } from "@std/assert"
import { createManifest, isValidManifestId } from "./manifest.ts"

Deno.test("isValidManifestId - valid IDs", () => {
  assertEquals(isValidManifestId("my_mod"), true)
  assertEquals(isValidManifestId("mod123"), true)
  assertEquals(isValidManifestId("a"), true)
  assertEquals(isValidManifestId("longer_mod_name_123"), true)
})

Deno.test("isValidManifestId - invalid IDs", () => {
  assertEquals(isValidManifestId(""), false)
  assertEquals(isValidManifestId("123mod"), false) // starts with number
  assertEquals(isValidManifestId("My_Mod"), false) // uppercase
  assertEquals(isValidManifestId("my-mod"), false) // hyphen
  assertEquals(isValidManifestId("my mod"), false) // space
})

// createManifest tests

Deno.test("createManifest - creates default manifest", () => {
  const manifest = createManifest(
    "test_mod",
    "Test Mod",
    "https://example.com/mod.zip",
  )

  assertEquals(manifest.schemaVersion, "1.0")
  assertEquals(manifest.id, "test_mod")
  assertEquals(manifest.displayName, "Test Mod")
  assertEquals(manifest.source.url, "https://example.com/mod.zip")
})
