/**
 * Fetch Command - Fetch modinfo.json from GitHub repos and generate manifests
 *
 * Uses Octokit for GitHub API calls with gh CLI auth token.
 */

import { Command } from "@cliffy/command"
import $ from "@david/dax"
import * as YAML from "@std/yaml/unstable-stringify"
import { join } from "@std/path"
import * as v from "valibot"
import { convertDependencies } from "../../schema/modinfo.ts"
import { type ModManifest, Version } from "../../schema/manifest.ts"
import {
  buildArchiveUrl,
  buildGitHubPath,
  getModId,
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

/** Generate manifest from discovered mod info */
const generateManifest = (
  mod: DiscoveredMod,
  owner: string,
  repo: string,
  branch: string,
  commitSha: string,
): ModManifest => {
  const modId = getModId(mod.modinfo) ?? "unknown"
  const manifestId = toManifestId(modId)
  const archiveUrl = buildArchiveUrl(owner, repo, branch)

  // Determine extract path - the directory containing modinfo.json
  const modDir = mod.path
  const extractPath = modDir === "" ? undefined : modDir

  // Set homepage to point to the actual mod folder if not in root
  const homepage = buildGitHubPath(owner, repo, branch, modDir === "" ? undefined : modDir)

  // Build manifest with only defined optional fields
  const manifest: ModManifest = {
    schemaVersion: "1.0",
    id: manifestId,
    displayName: stripColorCodes(mod.modinfo.name),
    shortDescription: stripColorCodes(mod.modinfo.description?.slice(0, 200) ?? ""),
    author: mod.modinfo.authors ?? ["Unknown"],
    license: "ALL-RIGHTS-RESERVED",
    homepage,
    version: v.parse(v.fallback(Version, "0.0.0"), mod.modinfo.version),
    source: {
      type: "github_archive",
      url: archiveUrl,
      ...(commitSha ? { commitSha } : {}),
      ...(extractPath ? { extractPath: `${repo}-${branch}/${extractPath}` } : {}),
    },
    ...(mod.modinfo.category ? { categories: [mod.modinfo.category] } : {}),
    ...(convertDependencies(mod.modinfo.dependencies)
      ? { dependencies: convertDependencies(mod.modinfo.dependencies) }
      : {}),
    autoupdate: {
      type: "commit",
      branch,
    },
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

    // Select mods to generate
    let selectedIndices: number[]

    if (options.all) {
      selectedIndices = modsToProcess.map((_, i) => i)
    } else {
      // Use dax multiSelect for interactive selection
      const selectOptions = modsToProcess.map((mod) => ({
        text: `${mod.modinfo.name} (${getModId(mod.modinfo)}) - ${mod.path || "root"}`,
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

    for (let i = 0; i < selectedMods.length; i++) {
      const mod = selectedMods[i]
      genProgress.position(i)
      genProgress.message(mod.modinfo.name)

      const manifest = generateManifest(
        mod,
        parsed.owner,
        parsed.repo,
        metadata.defaultBranch,
        metadata.commitSha,
      )
      const yamlContent = YAML.stringify(manifest, { quoteStyle: '"' })
      const filename = `${manifest.id}.yaml`
      const outputPath = join(options.output, filename)

      if (options.dryRun) {
        console.log(`\nWould create: ${outputPath}`)
        console.log("---")
        console.log(yamlContent)
      } else {
        await Deno.mkdir(options.output, { recursive: true })
        await Deno.writeTextFile(outputPath, yamlContent)
      }
    }
    genProgress.finish()

    console.log(`\n✓ Generated ${selectedMods.length} manifest(s)`)
  })
