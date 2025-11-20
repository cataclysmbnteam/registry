/// <reference lib="dom" />
/**
 * Source form section for download URL and related settings.
 */

import { store } from "./store.ts"

export const SourceSection = () => (
  <section>
    <h3>Source</h3>
    <fieldset>
      <label>Source Type</label>
      <select
        value={store.sourceType}
        onChange={(e) => (store.sourceType = e.currentTarget.value)}
      >
        <option value="github_archive">GitHub Archive</option>
        <option value="gitlab_archive">GitLab Archive</option>
        <option value="direct_url">Direct URL</option>
      </select>
    </fieldset>
    <fieldset>
      <label>Source URL *</label>
      <input
        type="url"
        placeholder="https://github.com/owner/repo/archive/refs/heads/main.zip"
        value={store.sourceUrl}
        onInput={(e) => (store.sourceUrl = e.currentTarget.value)}
      />
    </fieldset>
    <fieldset>
      <label>Commit SHA</label>
      <input
        type="text"
        placeholder="abc123..."
        value={store.commitSha}
        onInput={(e) => (store.commitSha = e.currentTarget.value)}
      />
    </fieldset>
    <fieldset>
      <label>Extract Path (for modpacks)</label>
      <input
        type="text"
        placeholder="repo-main/path/to/mod"
        value={store.extractPath}
        onInput={(e) => (store.extractPath = e.currentTarget.value)}
      />
      <small>
        Path inside the archive where the mod is located
      </small>
    </fieldset>
  </section>
)
