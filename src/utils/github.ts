/**
 * Shared GitHub utilities for both CLI and web.
 * Contains common logic for parsing GitHub URLs, fetching content,
 * and converting modinfo to manifest format.
 */

import { getModId } from "../schema/modinfo.ts"

/**
 * Parsed GitHub repository info
 */
export interface GitHubRepoInfo {
  owner: string
  repo: string
}

/**
 * Parse a GitHub URL to extract owner and repository name.
 * Supports various GitHub URL formats:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - https://github.com/owner/repo/tree/branch/path
 * - owner/repo (shorthand)
 *
 * @param url - GitHub URL or owner/repo shorthand
 * @returns Parsed repo info or null if invalid
 */
export const parseGitHubUrl = (url: string): GitHubRepoInfo | null => {
  const patterns = [
    /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/|$)/i,
    /^([^\/]+)\/([^\/]+)$/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ""),
      }
    }
  }
  return null
}

/**
 * Decode base64 string to UTF-8 text.
 * Properly handles multi-byte characters.
 *
 * @param base64 - Base64 encoded string (may contain newlines)
 * @returns Decoded UTF-8 string
 */
export const decodeBase64Utf8 = (base64: string): string => {
  // Remove newlines from base64 string
  const cleaned = base64.replace(/\n/g, "")
  // Decode base64 to binary string
  const binaryString = atob(cleaned)
  // Convert binary string to Uint8Array
  const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0))
  // Decode as UTF-8
  return new TextDecoder("utf-8").decode(bytes)
}

// Re-export color utilities for backwards compatibility
export { colorCodesToHtml, stripColorCodes } from "./color.ts"

// Re-export DiscoveredMod from github_fetch for backwards compatibility
export type { DiscoveredMod } from "./github_fetch.ts"

/**
 * Convert mod ID to a valid manifest ID.
 * - Lowercase
 * - Only alphanumeric and underscores
 * - No leading/trailing/consecutive underscores
 *
 * @param modId - Original mod ID
 * @returns Sanitized manifest ID
 */
export const toManifestId = (modId: string): string =>
  modId
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_")

/**
 * Extract repository URL from source URL or homepage.
 *
 * @param url - A URL that may contain GitHub repo info
 * @returns Repository URL or null
 */
export const extractRepoUrl = (url: string): string | null => {
  if (!url.includes("github.com")) return null

  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
  if (match) {
    return `https://github.com/${match[1]}/${match[2].replace(/\.git$/, "")}`
  }
  return null
}

/**
 * Get the directory containing the modinfo.json file.
 * Used to determine the extract path for archives.
 *
 * @param modinfoPath - Path to modinfo.json
 * @returns Directory path (empty string if root)
 */
export const getModDirectory = (modinfoPath: string): string => {
  const lastSlash = modinfoPath.lastIndexOf("/")
  if (lastSlash === -1) return ""
  return modinfoPath.substring(0, lastSlash)
}

/**
 * Build a GitHub archive URL for a repository.
 *
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param branch - Branch name
 * @returns Archive download URL
 */
export const buildArchiveUrl = (owner: string, repo: string, branch: string): string =>
  `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`

/**
 * Build a GitHub URL for a specific path in the repository.
 *
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param branch - Branch name
 * @param path - Path within repository (optional)
 * @returns GitHub URL to the path
 */
export const buildGitHubPath = (
  owner: string,
  repo: string,
  branch: string,
  path?: string,
): string => {
  if (!path || path === ".") {
    return `https://github.com/${owner}/${repo}`
  }
  return `https://github.com/${owner}/${repo}/tree/${branch}/${path}`
}

// Re-export getModId for convenience
export { getModId }
