/**
 * Tests for modinfo.json parsing.
 * Note: Schema validation is handled by valibot - we only test our parsing/conversion logic.
 */

import { assertEquals } from "@std/assert"
import { convertDependencies, modInfoToManifestBase, parseModInfo } from "./modinfo.ts"

Deno.test("parseModInfo - single object", () => {
  const json = JSON.stringify({
    type: "MOD_INFO",
    id: "test_mod",
    name: "Test Mod",
  })

  const result = parseModInfo(json)
  assertEquals(result.length, 1)
  assertEquals(result[0].id, "test_mod")
})

Deno.test("parseModInfo - array of objects", () => {
  const json = JSON.stringify([
    { type: "MOD_INFO", id: "mod1", name: "Mod 1" },
    { type: "OTHER", id: "other" }, // Should be filtered out
    { type: "MOD_INFO", id: "mod2", name: "Mod 2" },
  ])

  const result = parseModInfo(json)
  assertEquals(result.length, 2)
  assertEquals(result[0].id, "mod1")
  assertEquals(result[1].id, "mod2")
})

Deno.test("parseModInfo - non-MOD_INFO object", () => {
  const json = JSON.stringify({
    type: "CORE",
    id: "core",
  })

  const result = parseModInfo(json)
  assertEquals(result.length, 0)
})

Deno.test("parseModInfo - filters out invalid schema entries", () => {
  // Entry with invalid field types should be filtered out
  const json = JSON.stringify([
    { type: "MOD_INFO", id: "valid_mod", name: "Valid Mod" },
    { type: "MOD_INFO", id: 123, name: "Invalid ID type" }, // id should be string
    { type: "MOD_INFO", id: "another_valid", name: "Another Valid" },
  ])

  const result = parseModInfo(json)
  // Should filter out entry with invalid id type
  assertEquals(result.length, 2)
  assertEquals(result[0].id, "valid_mod")
  assertEquals(result[1].id, "another_valid")
})

Deno.test("parseModInfo - accepts valid optional fields", () => {
  const json = JSON.stringify({
    type: "MOD_INFO",
    id: "full_mod",
    name: "Full Mod",
    authors: ["Author1", "Author2"],
    description: "A description",
    category: "content",
    dependencies: ["bn"],
    version: "1.0.0",
    maintainers: ["Maintainer1"],
  })

  const result = parseModInfo(json)
  assertEquals(result.length, 1)
  assertEquals(result[0].id, "full_mod")
  assertEquals(result[0].authors, ["Author1", "Author2"])
  assertEquals(result[0].category, "content")
})

// convertDependencies tests

Deno.test("convertDependencies - undefined returns undefined", () => {
  assertEquals(convertDependencies(undefined), undefined)
  assertEquals(convertDependencies([]), undefined)
})

Deno.test("convertDependencies - bn gets default version", () => {
  const result = convertDependencies(["bn"])
  assertEquals(result, { bn: ">=0.9.1" })
})

Deno.test("convertDependencies - dda converted to bn", () => {
  const result = convertDependencies(["dda"])
  assertEquals(result, { bn: ">=0.9.1" })
})

Deno.test("convertDependencies - other mods get wildcard", () => {
  const result = convertDependencies(["other_mod"])
  assertEquals(result, { other_mod: "*" })
})

Deno.test("convertDependencies - mixed dependencies", () => {
  const result = convertDependencies(["bn", "arcana", "magiclysm"])
  assertEquals(result, {
    bn: ">=0.9.1",
    arcana: "*",
    magiclysm: "*",
  })
})

// modInfoToManifestBase tests

Deno.test("modInfoToManifestBase - converts fields", () => {
  const modinfo = {
    type: "MOD_INFO" as const,
    id: "test_mod",
    name: "Test Mod",
    description: "A test mod",
    authors: ["Author1", "Author2"],
    dependencies: ["dda", "other_mod"],
  }

  const result = modInfoToManifestBase(modinfo, "https://example.com")

  assertEquals(result.id, "test_mod")
  assertEquals(result.displayName, "Test Mod")
  assertEquals(result.description, "A test mod")
  assertEquals(result.author, "Author1, Author2")
  // dda -> bn with default version, other_mod gets wildcard
  assertEquals(result.dependencies, {
    bn: ">=0.9.1",
    other_mod: "*",
  })
})

Deno.test("modInfoToManifestBase - handles missing authors", () => {
  const modinfo = {
    type: "MOD_INFO" as const,
    id: "test_mod",
    name: "Test Mod",
  }

  const result = modInfoToManifestBase(modinfo, "https://example.com")
  assertEquals(result.author, "Unknown")
})
