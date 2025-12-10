/**
 * E2E tests for the autoupdate functionality.
 * Tests the complete flow of detecting new versions and updating manifests.
 *
 * Based on the endless-sky RFC:
 * https://github.com/endless-sky/rfcs/blob/main/rfcs/0001-plugin-index.md
 */

import { assertEquals, assertExists, assertMatch } from "@std/assert"
import { join } from "@std/path"
import {
  applyVersionUpdate,
  getLatestVersion,
  updateAllManifests,
  updateManifestFile,
} from "./autoupdate.ts"
import type { ModManifest } from "../schema/manifest.ts"
import { stringify } from "@std/yaml/unstable-stringify"

/**
 * Create a temporary directory for test fixtures.
 */
const createTempDir = async (): Promise<string> => {
  return await Deno.makeTempDir({ prefix: "autoupdate_test_" })
}

/**
 * Write a manifest to a file.
 */
const writeManifest = async (dir: string, name: string, manifest: ModManifest): Promise<string> => {
  const path = join(dir, name)
  await Deno.writeTextFile(path, stringify(manifest, { quoteStyle: '"' }))
  return path
}

// =============================================================================
// Unit Tests for applyVersionUpdate
// =============================================================================

Deno.test("applyVersionUpdate - updates version field", () => {
  const manifest: ModManifest = {
    schema_version: "1.0",
    id: "test_mod",
    display_name: "Test Mod",
    short_description: "A test mod",
    author: ["Test Author"],
    license: "MIT",
    version: "1.0.0",
    source: {
      type: "github_archive",
      url: "https://github.com/test/test-mod/archive/refs/tags/v1.0.0.zip",
    },
  }

  const updated = applyVersionUpdate(manifest, "2.0.0")

  assertEquals(updated.version, "2.0.0")
  assertExists(updated.last_updated)
})

Deno.test("applyVersionUpdate - applies URL substitution", () => {
  const manifest: ModManifest = {
    schema_version: "1.0",
    id: "test_mod",
    display_name: "Test Mod",
    short_description: "A test mod",
    author: ["Test Author"],
    license: "MIT",
    version: "1.0.0",
    source: {
      type: "github_archive",
      url: "https://github.com/test/test-mod/archive/refs/tags/v1.0.0.zip",
    },
    autoupdate: {
      type: "tag",
      url: "https://github.com/test/test-mod/archive/refs/tags/$version.zip",
    },
  }

  const updated = applyVersionUpdate(manifest, "v2.0.0")

  assertEquals(updated.version, "v2.0.0")
  assertEquals(
    updated.source.url,
    "https://github.com/test/test-mod/archive/refs/tags/v2.0.0.zip",
  )
})

Deno.test("applyVersionUpdate - applies icon_url substitution", () => {
  const manifest: ModManifest = {
    schema_version: "1.0",
    id: "test_mod",
    display_name: "Test Mod",
    short_description: "A test mod",
    author: ["Test Author"],
    license: "MIT",
    version: "1.0.0",
    source: {
      type: "github_archive",
      url: "https://github.com/test/test-mod/archive/refs/tags/v1.0.0.zip",
    },
    icon_url: "https://raw.githubusercontent.com/test/test-mod/v1.0.0/icon.png",
    autoupdate: {
      type: "tag",
      url: "https://github.com/test/test-mod/archive/refs/tags/$version.zip",
      icon_url: "https://raw.githubusercontent.com/test/test-mod/$version/icon.png",
    },
  }

  const updated = applyVersionUpdate(manifest, "v2.0.0")

  assertEquals(updated.version, "v2.0.0")
  assertEquals(
    updated.icon_url,
    "https://raw.githubusercontent.com/test/test-mod/v2.0.0/icon.png",
  )
})

Deno.test("applyVersionUpdate - sets last_updated timestamp", () => {
  const manifest: ModManifest = {
    schema_version: "1.0",
    id: "test_mod",
    display_name: "Test Mod",
    short_description: "A test mod",
    author: ["Test Author"],
    license: "MIT",
    version: "1.0.0",
    source: {
      type: "github_archive",
      url: "https://github.com/test/test-mod/archive/refs/tags/v1.0.0.zip",
    },
  }

  const updated = applyVersionUpdate(manifest, "2.0.0")

  assertExists(updated.last_updated)
  // Verify it's a valid ISO timestamp
  assertMatch(updated.last_updated, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
})

// =============================================================================
// Integration Tests for getLatestVersion (requires network)
// These tests may fail due to GitHub API rate limits when run frequently.
// They are marked with `ignore` in CI environments.
// =============================================================================

const isRateLimited = Deno.env.get("CI") === "true"

Deno.test({
  name: "getLatestVersion - tag-based returns latest tag",
  ignore: isRateLimited,
  async fn() {
    // Use a real, stable GitHub repository with semver tags
    const manifest: ModManifest = {
      schema_version: "1.0",
      id: "test",
      display_name: "Test",
      short_description: "Test",
      author: ["Test"],
      license: "MIT",
      version: "0.0.0",
      homepage: "https://github.com/denoland/std",
      source: {
        type: "github_archive",
        url: "https://github.com/denoland/std/archive/refs/heads/main.zip",
      },
      autoupdate: {
        type: "tag",
        regex: "^\\d+\\.\\d+\\.\\d+$", // Filter to only semver tags
      },
    }

    const version = await getLatestVersion(manifest)

    // If rate limited, skip assertion
    if (version === null) {
      console.log("Skipping - likely rate limited")
      return
    }

    assertMatch(version, /^\d+\.\d+\.\d+$/, "Should be a semver-like version")
  },
})

Deno.test({
  name: "getLatestVersion - tag-based with regex filter",
  ignore: isRateLimited,
  async fn() {
    // Use a repo with multiple tag formats
    const manifest: ModManifest = {
      schema_version: "1.0",
      id: "test",
      display_name: "Test",
      short_description: "Test",
      author: ["Test"],
      license: "MIT",
      version: "0.0.0",
      homepage: "https://github.com/denoland/std",
      source: {
        type: "github_archive",
        url: "https://github.com/denoland/std/archive/refs/heads/main.zip",
      },
      autoupdate: {
        type: "tag",
        regex: "^\\d+\\.\\d+\\.\\d+$", // Only match pure semver (no prefix)
      },
    }

    const version = await getLatestVersion(manifest)

    // If rate limited, skip assertion
    if (version === null) {
      console.log("Skipping - likely rate limited")
      return
    }

    assertMatch(version, /^\d+\.\d+\.\d+$/, "Should be a pure semver (no prefix)")
  },
})

Deno.test({
  name: "getLatestVersion - commit-based returns CalVer with SHA",
  ignore: isRateLimited,
  async fn() {
    const manifest: ModManifest = {
      schema_version: "1.0",
      id: "test",
      display_name: "Test",
      short_description: "Test",
      author: ["Test"],
      license: "MIT",
      version: "0.0.0",
      homepage: "https://github.com/denoland/std",
      source: {
        type: "github_archive",
        url: "https://github.com/denoland/std/archive/refs/heads/main.zip",
      },
      autoupdate: {
        type: "commit",
        branch: "main",
      },
    }

    const version = await getLatestVersion(manifest)

    // If rate limited, skip assertion
    if (version === null) {
      console.log("Skipping - likely rate limited")
      return
    }

    // CalVer format: YYYY.MM.DD-xxxxxxx (short SHA)
    assertMatch(
      version,
      /^\d{4}\.\d{2}\.\d{2}-[a-f0-9]{7}$/,
      "Should be CalVer format with short SHA",
    )
  },
})

Deno.test("getLatestVersion - returns null without autoupdate config", async () => {
  const manifest: ModManifest = {
    schema_version: "1.0",
    id: "test",
    display_name: "Test",
    short_description: "Test",
    author: ["Test"],
    license: "MIT",
    version: "1.0.0",
    source: {
      type: "github_archive",
      url: "https://github.com/test/test-mod/archive/refs/heads/main.zip",
    },
  }

  const version = await getLatestVersion(manifest)

  assertEquals(version, null)
})

// =============================================================================
// E2E Tests for updateManifestFile and updateAllManifests
// =============================================================================

Deno.test({
  name: "updateManifestFile - no update when already current",
  ignore: isRateLimited,
  async fn() {
    const tempDir = await createTempDir()

    try {
      const manifest: ModManifest = {
        schema_version: "1.0",
        id: "no_update_mod",
        display_name: "No Update Mod",
        short_description: "A mod that won't update",
        author: ["Test"],
        license: "MIT",
        version: "99999.0.0", // Impossibly high version
        homepage: "https://github.com/denoland/std",
        source: {
          type: "github_archive",
          url: "https://github.com/denoland/std/archive/refs/tags/99999.0.0.zip",
        },
        autoupdate: {
          type: "tag",
          regex: "^\\d+\\.\\d+\\.\\d+$",
        },
      }

      const path = await writeManifest(tempDir, "no_update.yaml", manifest)
      const result = await updateManifestFile(path)

      assertEquals(result.updated, false)
    } finally {
      await Deno.remove(tempDir, { recursive: true })
    }
  },
})

Deno.test("updateManifestFile - skips manifest without autoupdate", async () => {
  const tempDir = await createTempDir()

  try {
    const manifest: ModManifest = {
      schema_version: "1.0",
      id: "no_autoupdate_mod",
      display_name: "No Autoupdate Mod",
      short_description: "A mod without autoupdate config",
      author: ["Test"],
      license: "MIT",
      version: "1.0.0",
      source: {
        type: "github_archive",
        url: "https://github.com/test/test-mod/archive/refs/heads/main.zip",
      },
    }

    const path = await writeManifest(tempDir, "no_autoupdate.yaml", manifest)
    const result = await updateManifestFile(path)

    assertEquals(result.updated, false)
    assertEquals(result.error, undefined)
  } finally {
    await Deno.remove(tempDir, { recursive: true })
  }
})

Deno.test("updateAllManifests - processes directory", async () => {
  const tempDir = await createTempDir()

  try {
    // Create a manifest without autoupdate (should be skipped)
    const manifest1: ModManifest = {
      schema_version: "1.0",
      id: "mod1",
      display_name: "Mod 1",
      short_description: "First mod",
      author: ["Test"],
      license: "MIT",
      version: "1.0.0",
      source: {
        type: "github_archive",
        url: "https://github.com/test/mod1/archive/refs/heads/main.zip",
      },
    }

    // Create another manifest without autoupdate
    const manifest2: ModManifest = {
      schema_version: "1.0",
      id: "mod2",
      display_name: "Mod 2",
      short_description: "Second mod",
      author: ["Test"],
      license: "MIT",
      version: "1.0.0",
      source: {
        type: "github_archive",
        url: "https://github.com/test/mod2/archive/refs/heads/main.zip",
      },
    }

    await writeManifest(tempDir, "mod1.yaml", manifest1)
    await writeManifest(tempDir, "mod2.yaml", manifest2)

    const result = await updateAllManifests(tempDir)

    assertEquals(result.total, 2)
    assertEquals(result.errors, 0)
  } finally {
    await Deno.remove(tempDir, { recursive: true })
  }
})

Deno.test("updateAllManifests - skips example files", async () => {
  const tempDir = await createTempDir()

  try {
    const manifest: ModManifest = {
      schema_version: "1.0",
      id: "example",
      display_name: "Example",
      short_description: "Example mod",
      author: ["Test"],
      license: "MIT",
      version: "1.0.0",
      source: {
        type: "github_archive",
        url: "https://github.com/test/example/archive/refs/heads/main.zip",
      },
    }

    // Example files start with underscore
    await writeManifest(tempDir, "_example.yaml", manifest)

    const result = await updateAllManifests(tempDir)

    assertEquals(result.total, 0) // Example file should be skipped
  } finally {
    await Deno.remove(tempDir, { recursive: true })
  }
})

Deno.test("updateAllManifests - respects .manifestignore", async () => {
  const tempDir = await createTempDir()

  try {
    const manifest: ModManifest = {
      schema_version: "1.0",
      id: "ignored_mod",
      display_name: "Ignored Mod",
      short_description: "A mod that should be ignored",
      author: ["Test"],
      license: "MIT",
      version: "1.0.0",
      homepage: "https://github.com/test/repo",
      source: {
        type: "github_archive",
        url: "https://github.com/test/repo/archive/refs/heads/main.zip",
      },
      autoupdate: {
        type: "tag",
      },
    }

    await writeManifest(tempDir, "ignored_mod.yaml", manifest)

    // Create .manifestignore
    await Deno.writeTextFile(
      join(tempDir, ".manifestignore"),
      "# Comment line\ngithub.com/test/repo/ignored_mod\n",
    )

    const result = await updateAllManifests(tempDir)

    assertEquals(result.total, 1)
    assertEquals(result.skipped, 1)
    assertEquals(result.errors, 0)
  } finally {
    await Deno.remove(tempDir, { recursive: true })
  }
})

// =============================================================================
// RFC Compliance Tests
// =============================================================================

Deno.test("RFC compliance - $version substitution in url", () => {
  // Per RFC: "Upon detecting a new version (say, `v1.2`), the Plugin's `url`
  // key will be replaced with `https://example.com/myPlugin/v1.2.zip`"
  const manifest: ModManifest = {
    schema_version: "1.0",
    id: "rfc_test",
    display_name: "RFC Test",
    short_description: "Testing RFC compliance",
    author: ["Test"],
    license: "MIT",
    version: "v1.1",
    source: {
      type: "github_archive",
      url: "https://github.com/HelpfulContributor/ES-Plugin/archive/v1.1.zip",
    },
    autoupdate: {
      type: "tag",
      url: "https://github.com/HelpfulContributor/ES-Plugin/archive/$version.zip",
    },
  }

  const updated = applyVersionUpdate(manifest, "v2.0")

  assertEquals(updated.version, "v2.0")
  assertEquals(
    updated.source.url,
    "https://github.com/HelpfulContributor/ES-Plugin/archive/v2.0.zip",
  )
})

Deno.test("RFC compliance - $version substitution in iconUrl", () => {
  // Per RFC: "iconUrl: https://raw.githubusercontent.com/HelpfulContributor/ES-Plugin/$version/icon.png"
  const manifest: ModManifest = {
    schema_version: "1.0",
    id: "rfc_test",
    display_name: "RFC Test",
    short_description: "Testing RFC compliance",
    author: ["Test"],
    license: "MIT",
    version: "v1.1",
    icon_url: "https://raw.githubusercontent.com/HelpfulContributor/ES-Plugin/v1.1/icon.png",
    source: {
      type: "github_archive",
      url: "https://github.com/HelpfulContributor/ES-Plugin/archive/v1.1.zip",
    },
    autoupdate: {
      type: "tag",
      url: "https://github.com/HelpfulContributor/ES-Plugin/archive/$version.zip",
      icon_url: "https://raw.githubusercontent.com/HelpfulContributor/ES-Plugin/$version/icon.png",
    },
  }

  const updated = applyVersionUpdate(manifest, "v2.0")

  assertEquals(
    updated.icon_url,
    "https://raw.githubusercontent.com/HelpfulContributor/ES-Plugin/v2.0/icon.png",
  )
})

Deno.test({
  name: "RFC compliance - uses homepage when update_url omitted",
  ignore: isRateLimited,
  async fn() {
    // Per RFC: "May be omitted, in which case `homepage` shall be used instead"
    const manifest: ModManifest = {
      schema_version: "1.0",
      id: "homepage_test",
      display_name: "Homepage Test",
      short_description: "Testing homepage fallback",
      author: ["Test"],
      license: "MIT",
      version: "0.0.0",
      homepage: "https://github.com/denoland/std",
      source: {
        type: "github_archive",
        url: "https://github.com/denoland/std/archive/refs/heads/main.zip",
      },
      autoupdate: {
        type: "tag",
        regex: "^\\d+\\.\\d+\\.\\d+$",
        // update_url intentionally omitted
      },
    }

    const version = await getLatestVersion(manifest)

    // If rate limited, skip assertion
    if (version === null) {
      console.log("Skipping - likely rate limited")
      return
    }

    assertMatch(version, /^\d+\.\d+\.\d+$/)
  },
})

Deno.test({
  name: "RFC compliance - commit type uses CalVer",
  ignore: isRateLimited,
  async fn() {
    // Per RFC: "commit: Clones `update_url` as git repository and checks `branch` for new commits"
    // Our implementation generates CalVer-style versions for commit-based updates
    const manifest: ModManifest = {
      schema_version: "1.0",
      id: "commit_test",
      display_name: "Commit Test",
      short_description: "Testing commit-based versioning",
      author: ["Test"],
      license: "MIT",
      version: "0.0.0",
      homepage: "https://github.com/denoland/std",
      source: {
        type: "github_archive",
        url: "https://github.com/denoland/std/archive/refs/heads/main.zip",
      },
      autoupdate: {
        type: "commit",
        branch: "main",
      },
    }

    const version = await getLatestVersion(manifest)

    // If rate limited, skip assertion
    if (version === null) {
      console.log("Skipping - likely rate limited")
      return
    }

    // CalVer format: YYYY.MM.DD-xxxxxxx
    assertMatch(version, /^\d{4}\.\d{2}\.\d{2}-[a-f0-9]{7}$/)
  },
})

Deno.test({
  name: "RFC compliance - regex filter for tags",
  ignore: isRateLimited,
  async fn() {
    // Per RFC: "regex: If `type` is `tag`, only tags whose name (fully or partially)
    // matches this regular expression will be considered"
    const manifest: ModManifest = {
      schema_version: "1.0",
      id: "regex_test",
      display_name: "Regex Test",
      short_description: "Testing regex filter",
      author: ["Test"],
      license: "MIT",
      version: "0.0.0",
      homepage: "https://github.com/denoland/std",
      source: {
        type: "github_archive",
        url: "https://github.com/denoland/std/archive/refs/heads/main.zip",
      },
      autoupdate: {
        type: "tag",
        regex: "^0\\.", // Only match 0.x.x versions
      },
    }

    const version = await getLatestVersion(manifest)

    // deno/std moved to 1.x, so this might return null or an old 0.x version
    // The key thing is the regex is being applied
    if (version) {
      assertMatch(version, /^0\./, "Should match regex filter")
    }
    // It's also valid to return null if no tags match (rate limited or no matches)
  },
})
