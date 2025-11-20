/**
 * Tests for manifest checking utilities.
 */

import { assertEquals } from "@std/assert"
import type { ModManifest } from "../schema/manifest.ts"
import { checkManifest } from "./validator.ts"

Deno.test("checkManifest - valid manifest", () => {
  const manifest: ModManifest = {
    schemaVersion: "1.0",
    id: "test_mod",
    displayName: "Test Mod",
    shortDescription: "A test mod",
    author: ["Test Author"],
    license: "MIT",
    version: "1.0.0",
    source: {
      type: "github_archive",
      url: "https://github.com/test/mod/archive/v1.0.0.zip",
    },
  }

  const result = checkManifest(manifest)
  assertEquals(result.valid, true)
  assertEquals(result.errorCount, 0)
})

Deno.test("checkManifest - missing required fields", () => {
  const manifest: Partial<ModManifest> = {
    schemaVersion: "1.0",
  }

  const result = checkManifest(manifest)
  assertEquals(result.valid, false)
  assertEquals(result.errorCount > 0, true)
})

Deno.test("checkManifest - includes manifest ID in output", () => {
  const manifest: ModManifest = {
    schemaVersion: "1.0",
    id: "test_mod",
    displayName: "Test",
    shortDescription: "Test",
    author: ["Test"],
    license: "MIT",
    version: "1.0.0",
    source: {
      type: "github_archive",
      url: "https://example.com/mod.zip",
    },
  }

  const result = checkManifest(manifest, "test.yaml")
  assertEquals(result.output.includes("test.yaml"), true)
  assertEquals(result.output.includes("✓ Valid"), true)
})

Deno.test("checkManifest - shows error indicator", () => {
  const result = checkManifest({}, "test.yaml")
  assertEquals(result.output.includes("test.yaml"), true)
  assertEquals(result.output.includes("✗"), true)
})
