/// <reference lib="dom" />
/**
 * Manifest Generator Component
 *
 * Interactive form for generating mod manifest YAML files.
 * Supports:
 * - Manual field entry
 * - Upload modinfo.json to pre-fill
 * - Fetch from GitHub URL
 *
 * Uses deepsignal global store for state management.
 * Uses Octokit for GitHub API calls.
 */

import {
  buildArchiveUrl,
  parseGitHubUrl,
  stripColorCodes,
  toManifestId,
} from "../../../src/utils/github.ts"
import {
  createOctokit,
  discoverMods,
  fetchRepoMetadata,
} from "../../../src/utils/github_fetch.ts"
import {
  convertDependencies,
  parseModInfo,
} from "../../../src/schema/modinfo.ts"
import { storeToManifest } from "../../../src/schema/manifest.ts"
import { store } from "./manifest-generator/store.ts"
import { StatusMessages } from "./manifest-generator/StatusMessages.tsx"
import { GitHubImport } from "./manifest-generator/GitHubImport.tsx"
import { FileUpload } from "./manifest-generator/FileUpload.tsx"
import { IdentitySection } from "./manifest-generator/IdentitySection.tsx"
import { AttributionSection } from "./manifest-generator/AttributionSection.tsx"
import { VersionSection } from "./manifest-generator/VersionSection.tsx"
import { SourceSection } from "./manifest-generator/SourceSection.tsx"
import { CategoriesSection } from "./manifest-generator/CategoriesSection.tsx"
import { AutoupdateSection } from "./manifest-generator/AutoupdateSection.tsx"
import { ManifestOutput } from "./manifest-generator/ManifestOutput.tsx"
import { stringifyManifest } from "../../../src/utils/stringify.ts"

/** Generate manifest YAML from current store state using valibot schema */
const getManifestYaml = (): string => {
  const manifest = storeToManifest(store)
  return stringifyManifest(manifest)
}

/** Copy manifest YAML to clipboard */
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(getManifestYaml())
    store.copied = true
    setTimeout(() => {
      store.copied = false
    }, 2000)
  } catch {
    store.error = "Failed to copy to clipboard"
  }
}

/** Apply modinfo data to store */
const applyModInfo = (
  modinfo: {
    id?: string
    name: string
    description?: string
    authors?: string[]
    version?: string
    dependencies?: string[]
  },
  path?: string,
) => {
  if (modinfo.id) store.id = toManifestId(modinfo.id)
  store.displayName = stripColorCodes(modinfo.name || "")
  if (modinfo.description) {
    store.shortDescription = stripColorCodes(modinfo.description).slice(0, 200)
    store.description = stripColorCodes(modinfo.description)
  }
  if (modinfo.authors) store.author = modinfo.authors
  if (modinfo.version) store.version = modinfo.version
  if (modinfo.dependencies) {
    const deps = convertDependencies(modinfo.dependencies)
    if (deps) {
      store.dependencies = Object.entries(deps)
    }
  }

  const parsed = parseGitHubUrl(store.githubUrl)
  if (path && path !== "." && parsed) {
    store.extractPath = `${parsed.repo}-${store.autoupdateBranch}/${path}`
    store.homepage =
      `https://github.com/${parsed.owner}/${parsed.repo}/tree/${store.autoupdateBranch}/${path}`
  } else if (parsed) {
    store.extractPath = ""
    store.homepage = `https://github.com/${parsed.owner}/${parsed.repo}`
  }
}

/** Handle modinfo.json file upload */
const handleFileUpload = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    try {
      const content = reader.result as string
      const modinfos = parseModInfo(content)

      if (modinfos.length === 0) {
        store.error = "No valid MOD_INFO found in file"
        return
      }

      const modinfo = modinfos[0]
      applyModInfo(modinfo)
      store.success = `Loaded modinfo for "${modinfo.name}"`
      store.error = ""
    } catch (err) {
      store.error = `Failed to parse modinfo.json: ${err}`
    }
  }
  reader.readAsText(file)
}

/** Fetch from GitHub using Octokit */
const fetchFromGitHub = async () => {
  const parsed = parseGitHubUrl(store.githubUrl)
  if (!parsed) {
    store.error =
      "Invalid GitHub URL. Expected format: https://github.com/owner/repo"
    return
  }

  store.isLoading = true
  store.loadingMessage = "Fetching repository info..."
  store.error = ""
  store.foundMods = []
  store.selectedModIndex = -1
  store.progress = { current: 0, total: 0, step: "Getting repository info..." }

  try {
    // Create unauthenticated Octokit for web with rate limit tracking
    const octokit = createOctokit(undefined, (remaining, reset) => {
      store.rateLimit = { remaining, reset }
    })

    // Fetch repository metadata
    const metadata = await fetchRepoMetadata(octokit, parsed)
    store.autoupdateBranch = metadata.defaultBranch
    store.homepage = `https://github.com/${parsed.owner}/${parsed.repo}`
    store.commitSha = metadata.commitSha
    store.sourceUrl = buildArchiveUrl(
      parsed.owner,
      parsed.repo,
      metadata.defaultBranch,
    )

    // Discover all mods in the repository
    store.loadingMessage = "Scanning repository..."
    const mods = await discoverMods(
      octokit,
      parsed,
      metadata.defaultBranch,
      (current, total, step) => {
        store.progress = { current, total, step }
        store.loadingMessage = step
      },
    )

    if (mods.length === 0) {
      store.error = "No valid mods found in repository"
      store.isLoading = false
      store.progress = { current: 0, total: 0, step: "" }
      return
    }

    store.foundMods = mods
    store.success =
      `Found ${mods.length} mods. Select one to generate manifest.`
  } catch (err) {
    store.error = `Failed to fetch from GitHub: ${err}`
  } finally {
    store.isLoading = false
    store.loadingMessage = ""
    store.progress = { current: 0, total: 0, step: "" }
  }
}

/** Select a mod from found mods */
const selectMod = (index: number) => {
  if (index < 0 || index >= store.foundMods.length) return
  store.selectedModIndex = index

  const { modinfo, path } = store.foundMods[index]
  applyModInfo(modinfo, path)
  store.success = `Loaded "${modinfo.name}"`
}

export const ManifestGenerator = () => (
  <div class="manifest-generator">
    <StatusMessages />
    <div class="generator-layout">
      <div class="generator-form">
        <div class="import-row">
          <GitHubImport onFetch={fetchFromGitHub} onSelectMod={selectMod} />
          <FileUpload onFileUpload={handleFileUpload} />
        </div>
        <div class="form-sections">
          <IdentitySection />
          <AttributionSection />
          <VersionSection />
          <SourceSection />
          <CategoriesSection />
          <AutoupdateSection />
        </div>
      </div>
      <ManifestOutput
        manifestYaml={getManifestYaml()}
        copied={store.copied}
        onCopy={copyToClipboard}
      />
    </div>
  </div>
)
