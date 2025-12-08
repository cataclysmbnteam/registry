/// <reference lib="dom" />
/**
 * Autoupdate form section for automatic version updates.
 */

import { store } from "./store.ts"

export const AutoupdateSection = () => (
  <section class="form-section">
    <h3>Autoupdate</h3>
    <div class="form-group">
      <div class="toggle-switch">
        <button
          type="button"
          role="switch"
          aria-checked={store.enableAutoupdate}
          onClick={() => (store.enableAutoupdate = !store.enableAutoupdate)}
        />
        <span class="toggle-label">
          Enable automatic updates from source repository
        </span>
      </div>
      <small>
        When enabled, the registry will periodically check for new commits/releases and update the
        mod.
      </small>
    </div>
    {store.enableAutoupdate && (
      <>
        <div class="form-group">
          <label>Update Strategy</label>
          <div class="radio-group">
            <label class="radio-option">
              <input
                type="radio"
                name="autoupdate-type"
                value="commit"
                checked={store.autoupdateType === "commit"}
                onChange={() => (store.autoupdateType = "commit")}
              />
              <span class="radio-content">
                <strong>Track Branch</strong>
                <small>Follow latest commits on a branch</small>
              </span>
            </label>
            <label class="radio-option">
              <input
                type="radio"
                name="autoupdate-type"
                value="tag"
                checked={store.autoupdateType === "tag"}
                onChange={() => (store.autoupdateType = "tag")}
              />
              <span class="radio-content">
                <strong>Track Releases</strong>
                <small>Follow tagged releases only</small>
              </span>
            </label>
          </div>
        </div>
        {store.autoupdateType === "commit" && (
          <div class="form-group">
            <label>Branch</label>
            <input
              type="text"
              placeholder="main"
              value={store.autoupdateBranch}
              onInput={(e) => (store.autoupdateBranch = e.currentTarget.value)}
            />
          </div>
        )}
        {store.autoupdateType === "tag" && (
          <div class="form-group">
            <label>Tag Regex (optional)</label>
            <input
              type="text"
              placeholder="^v[0-9]+\.[0-9]+\.[0-9]+$"
              value={store.autoupdateRegex}
              onInput={(e) => (store.autoupdateRegex = e.currentTarget.value)}
            />
            <small>
              PCRE2 regex to filter tags. Only matching tags are considered for updates.
            </small>
          </div>
        )}
      </>
    )}
  </section>
)
