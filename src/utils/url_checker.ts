/**
 * URL validation utilities for mod registry.
 * Checks that URLs in manifests are reachable.
 */

/**
 * Result of a URL check.
 */
export interface UrlCheckResult {
  url: string
  ok: boolean
  status?: number
  error?: string
}

/**
 * Options for URL checking.
 */
export interface CheckOptions {
  /** Number of retry attempts for 5xx errors */
  retries?: number
  /** Delay between retries in ms */
  retryDelay?: number
  /** Request timeout in ms */
  timeout?: number
}

const DEFAULT_OPTIONS: Required<CheckOptions> = {
  retries: 3,
  retryDelay: 5000,
  timeout: 30000,
}

/**
 * Check if a URL is reachable using HEAD request.
 * Retries on 5xx server errors.
 *
 * @param url - URL to check
 * @param options - Check options
 * @returns Check result
 */
export async function checkUrl(
  url: string,
  options: CheckOptions = {},
): Promise<UrlCheckResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  for (let attempt = 0; attempt < opts.retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), opts.timeout)

      const response = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
        redirect: "follow",
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        return { url, ok: true, status: response.status }
      }

      // Retry on server errors
      if (response.status >= 500 && attempt < opts.retries - 1) {
        console.log(`  RETRY\t${response.status}\t${url}`)
        await sleep(opts.retryDelay)
        continue
      }

      return { url, ok: false, status: response.status }
    } catch (error) {
      if (attempt < opts.retries - 1) {
        console.log(`  RETRY\terror\t${url}`)
        await sleep(opts.retryDelay)
        continue
      }

      return {
        url,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  // Should not reach here
  return { url, ok: false, error: "Max retries exceeded" }
}

/**
 * Check multiple URLs in parallel.
 *
 * @param urls - URLs to check
 * @param options - Check options
 * @returns Array of check results
 */
export function checkUrls(
  urls: string[],
  options: CheckOptions = {},
): Promise<UrlCheckResult[]> {
  return Promise.all(urls.map((url) => checkUrl(url, options)))
}

/**
 * Extract all URLs from a manifest that should be checked.
 *
 * @param manifest - The manifest object
 * @returns Array of URLs to check
 */
export function extractManifestUrls(manifest: {
  source?: { url?: string }
  iconUrl?: string
  homepage?: string
}): string[] {
  const urls: string[] = []

  if (manifest.source?.url) {
    urls.push(manifest.source.url)
  }
  if (manifest.iconUrl) {
    urls.push(manifest.iconUrl)
  }
  // Homepage is informational, not critical
  // if (manifest.homepage) urls.push(manifest.homepage)

  return urls
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
