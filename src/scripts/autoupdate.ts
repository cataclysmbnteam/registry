#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net
/**
 * Autoupdate script for mod manifests.
 * Checks for new versions and updates manifests accordingly.
 */

import { Command } from "@cliffy/command"
import { stringify } from "@std/yaml/unstable-stringify"
import * as YAML from "@std/yaml"
import { walk } from "@std/fs"
import { canParse, compare as compareSemVer, tryParse } from "@std/semver"
import { join } from "@std/path"
import type { ModManifest } from "../schema/manifest.ts"
import { checkUrl } from "../utils/url_checker.ts"
import { GitHubCommitResponse, GitHubTagsResponse } from "../schema/github_api.ts"
import { extractRepoUrl as extractRepoUrlFromString, parseGitHubUrl } from "../utils/github.ts"
import * as v from "valibot"

/**
 * Load .manifestignore file and return list of ignored mod patterns.
 * Format: {repo url}/{mod id} per line.
 * Lines starting with # are comments.
 */
const loadManifestIgnore = async (dir: string): Promise<Set<string>> => {
  const ignorePath = join(dir, ".manifestignore")
  const ignored = new Set<string>()

  try {
    const content = await Deno.readTextFile(ignorePath)
    for (const line of content.split("\n")) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith("#")) {
        ignored.add(trimmed.toLowerCase())
      }
    }
  } catch {
    // File doesn't exist or can't be read, that's ok
  }

  return ignored
}

/**
 * Check if a manifest should be ignored during autoupdate.
 * @param manifest The manifest to check
 * @param ignored Set of ignored patterns from .manifestignore
 * @returns true if the manifest should be skipped
 */
const shouldIgnoreManifest = (manifest: ModManifest, ignored: Set<string>): boolean => {
  if (ignored.size === 0) return false

  // Get repo info from homepage or source URL
  const repoUrl = manifest.homepage ?? extractRepoUrl(manifest)
  if (!repoUrl) return false

  const repoInfo = parseGitHubUrl(repoUrl)
  if (!repoInfo) return false

  // Build the ignore pattern: github.com/owner/repo/mod_id
  const pattern = `github.com/${repoInfo.owner}/${repoInfo.repo}/${manifest.id}`.toLowerCase()

  return ignored.has(pattern)
}

/**
 * Get the latest version from a GitHub repository.
 * Supports tag-based and commit-based versioning.
 */
export const getLatestVersion = (
  manifest: ModManifest,
): Promise<string | null> => {
  const autoupdate = manifest.autoupdate
  if (!autoupdate) return Promise.resolve(null)

  const updateUrl = autoupdate.updateUrl ?? manifest.homepage ??
    extractRepoUrl(manifest)
  if (!updateUrl) return Promise.resolve(null)

  const repoInfo = parseGitHubUrl(updateUrl)
  if (!repoInfo) return Promise.resolve(null)

  if (autoupdate.type === "tag") {
    return getLatestTag(repoInfo.owner, repoInfo.repo, autoupdate.regex)
  } else if (autoupdate.type === "commit") {
    return getLatestCommit(
      repoInfo.owner,
      repoInfo.repo,
      autoupdate.branch ?? "main",
    )
  }

  return Promise.resolve(null)
}

/**
 * Extract repository URL from manifest source URL.
 * Uses shared utility for URL parsing.
 */
const extractRepoUrl = (manifest: ModManifest): string | null =>
  extractRepoUrlFromString(manifest.source.url)

const getLatestTag = async (
  owner: string,
  repo: string,
  regex?: string,
): Promise<string | null> => {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/tags?per_page=100`

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "BN-Mod-Registry/1.0",
      },
    })

    if (!response.ok) {
      console.error(`Failed to fetch tags: ${response.status}`)
      return null
    }

    const rawData = await response.json()
    const tags = v.parse(GitHubTagsResponse, rawData)

    let filteredTags = tags
    if (regex) {
      const re = new RegExp(regex)
      filteredTags = tags.filter((t) => re.test(t.name))
    }

    if (filteredTags.length === 0) return null

    // Sort by version comparison using @std/semver when possible
    filteredTags.sort((a, b) => compareVersions(b.name, a.name))

    return filteredTags[0].name
  } catch (error) {
    console.error(`Error fetching tags: ${error}`)
    return null
  }
}

const getLatestCommit = async (
  owner: string,
  repo: string,
  branch: string,
): Promise<string | null> => {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${branch}`

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "BN-Mod-Registry/1.0",
      },
    })

    if (!response.ok) {
      console.error(`Failed to fetch commit: ${response.status}`)
      return null
    }

    const rawData = await response.json()
    const commit = v.parse(GitHubCommitResponse, rawData)

    // Return short SHA for CalVer-style versioning
    const date = new Date()
    const calver = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${
      String(date.getDate()).padStart(2, "0")
    }`
    return `${calver}-${commit.sha.substring(0, 7)}`
  } catch (error) {
    console.error(`Error fetching commit: ${error}`)
    return null
  }
}

/**
 * Normalize version string for comparison.
 * Strips leading 'v' or 'V' prefix.
 */
const normalizeVersion = (version: string): string => version.replace(/^[vV]/, "")

/**
 * Compare version strings.
 * Uses @std/semver for valid semver strings, falls back to lexicographic comparison.
 * Handles SemVer, CalVer, and tag formats.
 */
const compareVersions = (a: string, b: string): number => {
  const cleanA = normalizeVersion(a)
  const cleanB = normalizeVersion(b)

  // Try to use @std/semver for valid semver strings
  if (canParse(cleanA) && canParse(cleanB)) {
    const semverA = tryParse(cleanA)
    const semverB = tryParse(cleanB)
    if (semverA && semverB) {
      return compareSemVer(semverA, semverB)
    }
  }

  // Fallback: Split into numeric and non-numeric parts for comparison
  const partsA = cleanA.split(/[.\-_]/)
  const partsB = cleanB.split(/[.\-_]/)

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const partA = partsA[i] ?? ""
    const partB = partsB[i] ?? ""

    const numA = parseInt(partA, 10)
    const numB = parseInt(partB, 10)

    if (!isNaN(numA) && !isNaN(numB)) {
      if (numA !== numB) return numA - numB
    } else {
      const cmp = partA.localeCompare(partB)
      if (cmp !== 0) return cmp
    }
  }

  return 0
}

/**
 * Update a manifest with a new version.
 * Applies substitution rules from autoupdate config.
 */
export const applyVersionUpdate = (
  manifest: ModManifest,
  newVersion: string,
): ModManifest => {
  const updated = { ...manifest }
  updated.version = newVersion

  if (manifest.autoupdate) {
    // Apply substitution keys
    for (const [key, value] of Object.entries(manifest.autoupdate)) {
      if (
        ["type", "updateUrl", "branch", "regex"].includes(key) ||
        typeof value !== "string"
      ) {
        continue
      }

      const substituted = value.replace(/\$version/g, newVersion)

      // Handle nested keys like source.url
      if (key === "url" && updated.source) {
        updated.source = { ...updated.source, url: substituted }
      } else if (key === "iconUrl") {
        updated.iconUrl = substituted
      } else if (key === "commitSha" && updated.source) {
        updated.source = { ...updated.source, commitSha: substituted }
      }
    }
  }

  return updated
}

/**
 * Update a single manifest file if a new version is available.
 */
export const updateManifestFile = async (
  filePath: string,
): Promise<{ updated: boolean; newVersion?: string; error?: string }> => {
  try {
    const content = await Deno.readTextFile(filePath)
    const manifest = YAML.parse(content) as ModManifest

    if (!manifest.autoupdate) {
      return { updated: false }
    }

    console.log(`Checking ${filePath}...`)

    const latestVersion = await getLatestVersion(manifest)
    if (!latestVersion) {
      return { updated: false, error: "Could not determine latest version" }
    }

    if (!canParse(latestVersion)) {
      return { updated: false, error: `Latest version is not valid semver: ${latestVersion}` }
    }

    if (latestVersion === manifest.version) {
      console.log(`  Already up to date: ${manifest.version}`)
      return { updated: false }
    }

    console.log(`  New version: ${manifest.version} -> ${latestVersion}`)

    const updated = applyVersionUpdate(manifest, latestVersion)

    // Verify URLs are valid before saving
    const urlsToCheck = [updated.source.url]
    if (updated.iconUrl) urlsToCheck.push(updated.iconUrl)

    for (const url of urlsToCheck) {
      const result = await checkUrl(url)
      if (!result.ok) {
        return { updated: false, error: `Invalid URL after update: ${url}` }
      }
    }

    // Write updated manifest
    await Deno.writeTextFile(filePath, stringify(updated, { quoteStyle: '"' }))

    return { updated: true, newVersion: latestVersion }
  } catch (error) {
    return { updated: false, error: String(error) }
  }
}

/**
 * Update all manifests in a directory.
 * Respects .manifestignore file for skipping specific mods.
 */
export const updateAllManifests = async (
  manifestDir: string,
): Promise<{ total: number; updated: number; errors: number; skipped: number }> => {
  let total = 0
  let updated = 0
  let errors = 0
  let skipped = 0

  // Load ignore list
  const ignored = await loadManifestIgnore(manifestDir)
  if (ignored.size > 0) {
    console.log(`Loaded ${ignored.size} entries from .manifestignore\n`)
  }

  for await (
    const entry of walk(manifestDir, {
      exts: [".yaml", ".yml", ".json"],
      includeDirs: false,
      maxDepth: 1,
    })
  ) {
    // Skip example files
    if (entry.name.startsWith("_")) continue

    // Skip dotfiles like .manifestignore
    if (entry.name.startsWith(".")) continue

    total++

    // Check if this manifest should be ignored
    try {
      const content = await Deno.readTextFile(entry.path)
      const manifest = YAML.parse(content) as ModManifest

      if (shouldIgnoreManifest(manifest, ignored)) {
        console.log(`Skipping ${entry.name} (in .manifestignore)`)
        skipped++
        continue
      }
    } catch {
      // Continue with normal processing if we can't read the manifest
    }

    const result = await updateManifestFile(entry.path)

    if (result.updated) {
      updated++
      console.log(`  ✓ Updated to ${result.newVersion}`)
    } else if (result.error) {
      errors++
      console.error(`  ✗ Error: ${result.error}`)
    }
  }

  return { total, updated, errors, skipped }
}

// CLI entry point
if (import.meta.main) {
  await new Command()
    .name("autoupdate")
    .version("1.0.0")
    .description("Check for new versions and update mod manifests")
    .arguments("[target:string]")
    .action(async (_options, target = "manifests") => {
      try {
        const stat = await Deno.stat(target)

        if (stat.isDirectory) {
          console.log(`Updating manifests in ${target}/`)
          const result = await updateAllManifests(target)
          const skipMsg = result.skipped > 0 ? `, ${result.skipped} skipped` : ""
          console.log(
            `\nDone: ${result.updated}/${result.total} updated, ${result.errors} errors${skipMsg}`,
          )
        } else {
          const result = await updateManifestFile(target)
          if (result.updated) {
            console.log(`Updated to ${result.newVersion}`)
          } else if (result.error) {
            console.error(`Error: ${result.error}`)
            Deno.exit(1)
          } else {
            console.log("No update needed")
          }
        }
      } catch (error) {
        console.error(`Error: ${error}`)
        Deno.exit(1)
      }
    })
    .parse(Deno.args)
}
