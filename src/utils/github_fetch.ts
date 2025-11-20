/**
 * Shared GitHub repository fetching logic using Octokit.
 *
 * Provides a common interface for fetching modinfo.json files from GitHub repositories.
 * Uses Octokit for API calls - works for both CLI (with gh auth token) and web (unauthenticated).
 */

import { Octokit } from "@octokit/rest"
import { type ModInfo, parseModInfo } from "../schema/modinfo.ts"
import { decodeBase64Utf8, type GitHubRepoInfo, parseGitHubUrl } from "./github.ts"

/** Re-export Octokit type for consumers */
export type { Octokit }

/** Discovered mod from a repository */
export interface DiscoveredMod {
  modinfo: ModInfo
  path: string
}

/** Repository metadata */
export interface RepoMetadata {
  owner: string
  repo: string
  defaultBranch: string
  commitSha: string
}

/** Progress callback for reporting fetch progress */
export type ProgressCallback = (current: number, total: number, message: string) => void

/** Rate limit callback for reporting API rate limit status */
export type RateLimitCallback = (remaining: number, reset: Date) => void

/** Create an Octokit instance with optional auth and rate limit callback */
export const createOctokit = (auth?: string, onRateLimit?: RateLimitCallback): Octokit => {
  const octokit = new Octokit({
    auth,
    userAgent: "cata-bn-registry/1.0",
  })

  // Hook into rate limit headers if callback provided
  if (onRateLimit) {
    octokit.hook.after("request", (response) => {
      const remaining = parseInt(response.headers["x-ratelimit-remaining"] as string, 10)
      const resetTimestamp = parseInt(response.headers["x-ratelimit-reset"] as string, 10)
      if (!isNaN(remaining) && !isNaN(resetTimestamp)) {
        onRateLimit(remaining, new Date(resetTimestamp * 1000))
      }
    })
  }

  return octokit
}

/** Fetch repository metadata using Octokit */
export const fetchRepoMetadata = async (
  octokit: Octokit,
  repoInfo: GitHubRepoInfo,
): Promise<RepoMetadata> => {
  const { data: repoData } = await octokit.rest.repos.get({
    owner: repoInfo.owner,
    repo: repoInfo.repo,
  })
  const defaultBranch = repoData.default_branch

  let commitSha = ""
  try {
    const { data: commitData } = await octokit.rest.repos.getCommit({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      ref: defaultBranch,
    })
    commitSha = commitData.sha
  } catch {
    // Commit fetch is optional
  }

  return {
    owner: repoInfo.owner,
    repo: repoInfo.repo,
    defaultBranch,
    commitSha,
  }
}

/** Discover all mods in a GitHub repository using Octokit */
export const discoverMods = async (
  octokit: Octokit,
  repoInfo: GitHubRepoInfo,
  branch: string,
  onProgress?: ProgressCallback,
): Promise<DiscoveredMod[]> => {
  onProgress?.(0, 0, "Scanning repository...")

  const { data: treeData } = await octokit.rest.git.getTree({
    owner: repoInfo.owner,
    repo: repoInfo.repo,
    tree_sha: branch,
    recursive: "1",
  })

  const modinfoFiles = treeData.tree.filter(
    (item) => item.type === "blob" && item.path?.endsWith("modinfo.json"),
  )

  if (modinfoFiles.length === 0) return []

  const mods: DiscoveredMod[] = []

  for (let i = 0; i < modinfoFiles.length; i++) {
    const file = modinfoFiles[i]
    if (!file.path) continue

    onProgress?.(i + 1, modinfoFiles.length, `Fetching ${file.path}...`)

    try {
      const { data: contentData } = await octokit.rest.repos.getContent({
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        path: file.path,
        ref: branch,
      })

      if (!("content" in contentData) || !contentData.content) continue

      const decoded = decodeBase64Utf8(contentData.content)
      const modinfos = parseModInfo(decoded)

      for (const modinfo of modinfos) {
        if (!modinfo.id) continue
        mods.push({
          modinfo,
          path: file.path.replace(/\/modinfo\.json$/, "").replace(/^modinfo\.json$/, ""),
        })
      }
    } catch {
      // Continue on individual file errors
      continue
    }
  }

  return mods
}

/** Parse and validate a GitHub URL */
export { parseGitHubUrl }
