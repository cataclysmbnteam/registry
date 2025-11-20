/**
 * Tests for shared GitHub utilities.
 */

import { assertEquals } from "@std/assert"
import {
  buildArchiveUrl,
  buildGitHubPath,
  decodeBase64Utf8,
  getModDirectory,
  parseGitHubUrl,
  toManifestId,
} from "./github.ts"

// parseGitHubUrl tests

Deno.test("parseGitHubUrl - full HTTPS URL", () => {
  const result = parseGitHubUrl("https://github.com/owner/repo")
  assertEquals(result, { owner: "owner", repo: "repo" })
})

Deno.test("parseGitHubUrl - HTTPS URL with trailing slash", () => {
  const result = parseGitHubUrl("https://github.com/owner/repo/")
  assertEquals(result, { owner: "owner", repo: "repo" })
})

Deno.test("parseGitHubUrl - HTTPS URL with .git", () => {
  const result = parseGitHubUrl("https://github.com/owner/repo.git")
  assertEquals(result, { owner: "owner", repo: "repo" })
})

Deno.test("parseGitHubUrl - URL with branch path", () => {
  const result = parseGitHubUrl("https://github.com/owner/repo/tree/main/path")
  assertEquals(result, { owner: "owner", repo: "repo" })
})

Deno.test("parseGitHubUrl - shorthand format", () => {
  const result = parseGitHubUrl("owner/repo")
  assertEquals(result, { owner: "owner", repo: "repo" })
})

Deno.test("parseGitHubUrl - invalid URL returns null", () => {
  const result = parseGitHubUrl("not-a-url")
  assertEquals(result, null)
})

Deno.test("parseGitHubUrl - GitLab URL returns null", () => {
  const result = parseGitHubUrl("https://gitlab.com/owner/repo")
  assertEquals(result, null)
})

// decodeBase64Utf8 tests

Deno.test("decodeBase64Utf8 - simple ASCII", () => {
  const base64 = btoa("Hello, World!")
  const result = decodeBase64Utf8(base64)
  assertEquals(result, "Hello, World!")
})

Deno.test("decodeBase64Utf8 - handles newlines in base64", () => {
  // Base64 content with newlines (as GitHub API returns)
  const properBase64 = "SGVs\nbG8s\nIFdv\ncmxk\nIQ=="
  const result = decodeBase64Utf8(properBase64)
  assertEquals(result, "Hello, World!")
})

Deno.test("decodeBase64Utf8 - UTF-8 characters", () => {
  // "日本語" in UTF-8 base64
  const base64 = "5pel5pys6Kqe"
  const result = decodeBase64Utf8(base64)
  assertEquals(result, "日本語")
})

// toManifestId tests

Deno.test("toManifestId - lowercase conversion", () => {
  const result = toManifestId("MyMod")
  assertEquals(result, "mymod")
})

Deno.test("toManifestId - replaces special characters", () => {
  const result = toManifestId("My-Mod.Test")
  assertEquals(result, "my_mod_test")
})

Deno.test("toManifestId - removes leading/trailing underscores", () => {
  const result = toManifestId("_my_mod_")
  assertEquals(result, "my_mod")
})

Deno.test("toManifestId - collapses consecutive underscores", () => {
  const result = toManifestId("my___mod")
  assertEquals(result, "my_mod")
})

Deno.test("toManifestId - handles complex mod ID", () => {
  const result = toManifestId("Arcana-BN (v1.0)")
  assertEquals(result, "arcana_bn_v1_0")
})

// getModDirectory tests

Deno.test("getModDirectory - extracts directory from path", () => {
  const result = getModDirectory("mods/test_mod/modinfo.json")
  assertEquals(result, "mods/test_mod")
})

Deno.test("getModDirectory - handles root level file", () => {
  const result = getModDirectory("modinfo.json")
  assertEquals(result, "")
})

Deno.test("getModDirectory - handles nested path", () => {
  const result = getModDirectory("data/mods/deep/path/modinfo.json")
  assertEquals(result, "data/mods/deep/path")
})

// buildArchiveUrl tests

Deno.test("buildArchiveUrl - builds correct URL", () => {
  const result = buildArchiveUrl("owner", "repo", "main")
  assertEquals(result, "https://github.com/owner/repo/archive/refs/heads/main.zip")
})

Deno.test("buildArchiveUrl - handles different branch", () => {
  const result = buildArchiveUrl("user", "project", "develop")
  assertEquals(result, "https://github.com/user/project/archive/refs/heads/develop.zip")
})

// buildGitHubPath tests

Deno.test("buildGitHubPath - repository root", () => {
  const result = buildGitHubPath("owner", "repo", "main")
  assertEquals(result, "https://github.com/owner/repo")
})

Deno.test("buildGitHubPath - with path", () => {
  const result = buildGitHubPath("owner", "repo", "main", "mods/test")
  assertEquals(result, "https://github.com/owner/repo/tree/main/mods/test")
})

Deno.test("buildGitHubPath - with dot path (root)", () => {
  const result = buildGitHubPath("owner", "repo", "main", ".")
  assertEquals(result, "https://github.com/owner/repo")
})

Deno.test("buildGitHubPath - handles different branch", () => {
  const result = buildGitHubPath("user", "project", "develop", "src/mod")
  assertEquals(result, "https://github.com/user/project/tree/develop/src/mod")
})
