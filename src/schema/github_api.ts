/**
 * Valibot schemas for GitHub API responses.
 * Used for validating unknown data from GitHub API calls.
 */

import * as v from "valibot"

/**
 * GitHub tree item (from /repos/{owner}/{repo}/git/trees/{sha})
 */
export const GitHubTreeItem = v.object({
  path: v.string(),
  type: v.picklist(["blob", "tree", "commit"]),
  sha: v.optional(v.string()),
  size: v.optional(v.number()),
  url: v.optional(v.string()),
  mode: v.optional(v.string()),
})
export type GitHubTreeItem = v.InferOutput<typeof GitHubTreeItem>

/**
 * GitHub tree response (from /repos/{owner}/{repo}/git/trees/{sha})
 */
export const GitHubTreeResponse = v.object({
  sha: v.string(),
  url: v.string(),
  tree: v.array(GitHubTreeItem),
  truncated: v.optional(v.boolean()),
})
export type GitHubTreeResponse = v.InferOutput<typeof GitHubTreeResponse>

/**
 * GitHub file content response (from /repos/{owner}/{repo}/contents/{path})
 */
export const GitHubContentResponse = v.object({
  name: v.string(),
  path: v.string(),
  sha: v.string(),
  size: v.number(),
  type: v.string(),
  content: v.optional(v.string()),
  encoding: v.optional(v.string()),
  url: v.string(),
  html_url: v.optional(v.string()),
  git_url: v.optional(v.string()),
  download_url: v.optional(v.union([v.string(), v.null_()])),
})
export type GitHubContentResponse = v.InferOutput<typeof GitHubContentResponse>

/**
 * GitHub repository response (from /repos/{owner}/{repo})
 */
export const GitHubRepoResponse = v.looseObject({
  id: v.number(),
  name: v.string(),
  full_name: v.string(),
  default_branch: v.string(),
  description: v.optional(v.union([v.string(), v.null_()])),
  html_url: v.string(),
  clone_url: v.optional(v.string()),
})
export type GitHubRepoResponse = v.InferOutput<typeof GitHubRepoResponse>

/**
 * GitHub commit response (from /repos/{owner}/{repo}/commits/{ref})
 */
export const GitHubCommitResponse = v.looseObject({
  sha: v.string(),
  url: v.string(),
  html_url: v.optional(v.string()),
  commit: v.optional(v.looseObject({
    message: v.optional(v.string()),
  })),
})
export type GitHubCommitResponse = v.InferOutput<typeof GitHubCommitResponse>

/**
 * GitHub tag item (from /repos/{owner}/{repo}/tags)
 */
export const GitHubTagItem = v.object({
  name: v.string(),
  zipball_url: v.optional(v.string()),
  tarball_url: v.optional(v.string()),
  commit: v.object({
    sha: v.string(),
    url: v.string(),
  }),
})
export type GitHubTagItem = v.InferOutput<typeof GitHubTagItem>

/**
 * GitHub tags response (array of tag items)
 */
export const GitHubTagsResponse = v.array(GitHubTagItem)
export type GitHubTagsResponse = v.InferOutput<typeof GitHubTagsResponse>

/**
 * GitHub code search result item
 */
export const GitHubSearchCodeItem = v.looseObject({
  name: v.string(),
  path: v.string(),
  sha: v.string(),
  url: v.string(),
  git_url: v.optional(v.string()),
  html_url: v.optional(v.string()),
  repository: v.optional(v.looseObject({
    id: v.number(),
    name: v.string(),
    full_name: v.string(),
  })),
})
export type GitHubSearchCodeItem = v.InferOutput<typeof GitHubSearchCodeItem>

/**
 * GitHub code search response
 */
export const GitHubSearchCodeResponse = v.object({
  total_count: v.number(),
  incomplete_results: v.boolean(),
  items: v.array(GitHubSearchCodeItem),
})
export type GitHubSearchCodeResponse = v.InferOutput<typeof GitHubSearchCodeResponse>
