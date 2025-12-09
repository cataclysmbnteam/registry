/**
 * Fetch Command - Fetch modinfo.json from GitHub repos and generate manifests
 *
 * Uses Octokit for GitHub API calls with gh CLI auth token.
 */

import { Command } from "@cliffy/command"
import $ from "@david/dax"
import { equal } from "@std/assert/equal"
import { deepMerge } from "@std/collections/deep-merge"
import { join } from "@std/path"
import * as v from "valibot"
import { parse as parseYAML } from "@std/yaml/parse"
import { convertDependencies } from "../../schema/modinfo.ts"
import { type ModManifest, Version } from "../../schema/manifest.ts"
import {
  buildArchiveUrl,
  buildGitHubPath,
  parseGitHubUrl,
  stripColorCodes,
  toManifestId,
} from "../../utils/github.ts"
import {
  createOctokit,
  type DiscoveredMod,
  discoverMods,
  fetchRepoMetadata,
} from "../../utils/github_fetch.ts"
import { detectParentMod } from "../../utils/validator.ts"
import { stringifyManifest } from "../../utils/stringify.ts"

/** Read existing manifest from file if it exists */
const readExistingManifest = async (path: string): Promise<ModManifest | null> => {
  try {
    const content = await Deno.readTextFile(path)
    return parseYAML(content) as ModManifest
  } catch {
    return null
  }
}

/**
 * Merge new manifest with existing manifest using deep merge.
 * Existing values take precedence for manually edited fields,
 * but new values update source/version info.
 */
const mergeManifests = (
  existing: ModManifest,
  generated: ModManifest,
): ModManifest => deepMerge(existing, generated, { arrays: "replace" }) as ModManifest

/**
 * Check if two manifests are effectively the same, ignoring last_updated field.
 * Returns true if only difference is last_updated.
 */
const manifestsEqualIgnoringLastUpdated = (
  a: ModManifest,
  b: ModManifest,
): boolean => {
  // Create copies without last_updated
  const { last_updated: _aLastUpdated, ...aWithoutTimestamp } = a
  const { last_updated: _bLastUpdated, ...bWithoutTimestamp } = b

  // Use deep equality comparison (order-independent)
  return equal(aWithoutTimestamp, bWithoutTimestamp)
}

/** Get GitHub auth token from gh CLI */
const getGhAuthToken = async (): Promise<string> => {
  try {
    const token = await $`gh auth token`.quiet().text()
    return token.trim()
  } catch {
    return ""
  }
}

/** Check if GitHub CLI is available */
const checkGhCli = async (): Promise<boolean> => {
  try {
    await $`gh --version`.quiet()
    return true
  } catch {
    return false
  }
}

/**
 * Normalize dependency keys to lowercase for consistent matching.
 * e.g., "Arcana" -> "arcana"
 */
const normalizeDependencies = (
  deps: Record<string, string> | undefined,
): Record<string, string> | undefined => {
  if (!deps) return undefined
  const normalized: Record<string, string> = {}
  for (const [key, value] of Object.entries(deps)) {
    normalized[key.toLowerCase()] = value
  }
  return normalized
}

/** Generate manifest from discovered mod info */
const generateManifest = (
  mod: DiscoveredMod,
  owner: string,
  repo: string,
  branch: string,
  commitSha: string,
): ModManifest => {
  const modId = mod.modinfo.id ?? "unknown"
  const manifestId = toManifestId(modId)
  const archiveUrl = buildArchiveUrl(owner, repo, branch)

  // Determine extract path - the directory containing modinfo.json
  const modDir = mod.path
  const extractPath = modDir === "" ? undefined : modDir

  // Set homepage to point to the actual mod folder if not in root
  const homepage = buildGitHubPath(owner, repo, branch, modDir === "" ? undefined : modDir)

  // Normalize dependencies to lowercase
  const deps = normalizeDependencies(convertDependencies(mod.modinfo.dependencies))

  // Build manifest first without parent to check for parent detection
  const manifest: ModManifest = {
    schema_version: "1.0",
    id: manifestId,
    display_name: stripColorCodes(mod.modinfo.name),
    short_description: stripColorCodes(mod.modinfo.description?.slice(0, 200) ?? ""),
    author: mod.modinfo.authors ?? ["Unknown"],
    license: mod.modinfo.license ?? "ALL-RIGHTS-RESERVED",
    homepage,
    version: v.parse(v.fallback(Version, "0.0.0"), mod.modinfo.version),
    source: {
      type: "github_archive",
      url: archiveUrl,
      ...(commitSha ? { commit_sha: commitSha } : {}),
      ...(extractPath ? { extract_path: extractPath } : {}),
    },
    ...(mod.modinfo.category ? { categories: [mod.modinfo.category] } : {}),
    ...(deps ? { dependencies: deps } : {}),
    autoupdate: {
      type: "commit",
      branch,
    },
    last_updated: new Date().toISOString(),
  }

  // Auto-detect and set parent mod based on naming pattern and dependencies
  const detectedParent = detectParentMod(manifest)
  if (detectedParent) {
    manifest.parent = detectedParent
  }

  return manifest
}

/** Fetch command for getting modinfo.json from GitHub and generating manifests */
export const fetchCommand = new Command()
  .description("Fetch modinfo.json files from a GitHub repository and generate manifests")
  .arguments("<url:string>")
  .option("-o, --output <dir:string>", "Output directory for manifests", { default: "manifests" })
  .option("-a, --all", "Generate manifests for all mods without prompting")
  .option("--filter <pattern:string>", "Filter mods by path pattern (regex)")
  .option("--exclude <pattern:string>", "Exclude mods by path pattern (regex)")
  .option("--dry-run", "Show what would be generated without writing files")
  .action(async (options, url) => {
    // Check for gh CLI
    if (!(await checkGhCli())) {
      console.error("Error: GitHub CLI (gh) is not installed or not authenticated.")
      console.error("Install it from: https://cli.github.com/")
      console.error("Then authenticate with: gh auth login")
      Deno.exit(1)
    }

    // Parse GitHub URL
    const parsed = parseGitHubUrl(url)
    if (!parsed) {
      console.error("Error: Invalid GitHub URL or owner/repo format")
      console.error("Examples:")
      console.error("  https://github.com/owner/repo")
      console.error("  owner/repo")
      Deno.exit(1)
    }

    console.log(`\n📦 Fetching mods from ${parsed.owner}/${parsed.repo}...\n`)

    // Get auth token from gh CLI and create Octokit
    const authToken = await getGhAuthToken()
    const octokit = createOctokit(authToken || undefined)

    // Fetch repository metadata
    const metadataProgress = $.progress("Fetching repository info").length(undefined)
    metadataProgress.message("Getting default branch...")
    const metadata = await metadataProgress.with(() => fetchRepoMetadata(octokit, parsed))

    console.log(`Using branch: ${metadata.defaultBranch}`)
    if (metadata.commitSha) {
      console.log(`Latest commit: ${metadata.commitSha.slice(0, 8)}`)
    }
    console.log()

    // Discover all mods
    const discoverProgress = $.progress("Scanning repository").length(undefined)
    let discoveredMods: DiscoveredMod[] = []
    let currentTotal = 0

    discoverProgress.message("Finding modinfo.json files...")
    discoveredMods = await discoverProgress.with(() =>
      discoverMods(
        octokit,
        parsed,
        metadata.defaultBranch,
        (_current, total, step) => {
          if (total > 0 && total !== currentTotal) {
            currentTotal = total
          }
          discoverProgress.message(step)
        },
      )
    )

    if (discoveredMods.length === 0) {
      console.log("No valid MOD_INFO entries found.")
      Deno.exit(0)
    }

    console.log(`\nFound ${discoveredMods.length} mod(s)\n`)

    // Apply filter if specified
    let modsToProcess = discoveredMods
    if (options.filter) {
      const filterRegex = new RegExp(options.filter)
      modsToProcess = discoveredMods.filter((mod) => filterRegex.test(mod.path))
      console.log(
        `Filtered to ${modsToProcess.length} mod(s) matching pattern: ${options.filter}\n`,
      )
    }
    if (options.exclude) {
      const excludeRegex = new RegExp(options.exclude)
      modsToProcess = modsToProcess.filter((mod) => !excludeRegex.test(mod.path))
      console.log(
        `Excluded mods matching pattern: ${options.exclude}, ${modsToProcess.length} mod(s) remain\n`,
      )
    }

    // Select mods to generate
    let selectedIndices: number[]

    if (options.all) {
      selectedIndices = modsToProcess.map((_, i) => i)
    } else {
      // Use dax multiSelect for interactive selection
      const selectOptions = modsToProcess.map((mod) => ({
        text: `${mod.modinfo.name} (${mod.modinfo.id}) - ${mod.path || "root"}`,
        selected: true,
      }))

      selectedIndices = (await $.maybeMultiSelect({
        message: "Select mods to generate manifests for:",
        options: selectOptions,
      })) ?? []

      if (selectedIndices.length === 0) {
        console.log("No mods selected.")
        Deno.exit(0)
      }
    }

    // Generate manifests for selected mods with progress
    const selectedMods = selectedIndices.map((i) => modsToProcess[i])
    const genProgress = $.progress("Generating manifests").length(selectedMods.length)
    let createdCount = 0
    let updatedCount = 0
    let skippedCount = 0

    for (let i = 0; i < selectedMods.length; i++) {
      const mod = selectedMods[i]
      genProgress.position(i)
      genProgress.message(mod.modinfo.name)

      const generated = generateManifest(
        mod,
        parsed.owner,
        parsed.repo,
        metadata.defaultBranch,
        metadata.commitSha,
      )
      const filename = `${generated.id}.yaml`
      const outputPath = join(options.output, filename)

      // Read existing manifest and deep-merge if it exists
      const existing = await readExistingManifest(outputPath)

      // Skip if generated manifest has no meaningful changes from existing
      // (compare generated vs existing, not merged vs existing, since merge favors existing)
      if (existing && manifestsEqualIgnoringLastUpdated(existing, generated)) {
        skippedCount++
        continue
      }

      const manifest = existing ? mergeManifests(existing, generated) : generated

      const yamlContent = stringifyManifest(manifest)

      if (options.dryRun) {
        console.log(`\nWould ${existing ? "update" : "create"}: ${outputPath}`)
        console.log("---")
        console.log(yamlContent)
      } else {
        await Deno.mkdir(options.output, { recursive: true })
        await Deno.writeTextFile(outputPath, yamlContent)
      }

      if (existing) {
        updatedCount++
      } else {
        createdCount++
      }
    }
    genProgress.finish()

    const parts: string[] = []
    if (createdCount > 0) parts.push(`${createdCount} created`)
    if (updatedCount > 0) parts.push(`${updatedCount} updated`)
    if (skippedCount > 0) parts.push(`${skippedCount} unchanged`)
    console.log(`\n✓ ${parts.join(", ")}`)
  })
