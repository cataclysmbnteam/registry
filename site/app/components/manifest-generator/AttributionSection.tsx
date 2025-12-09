/// <reference lib="dom" />
/**
 * Attribution form section for author, license, homepage, and icon.
 */

import { CommonLicenses } from "./types.ts"
import { store } from "./store.ts"

export const AttributionSection = () => (
  <section class="form-section">
    <h3>Attribution</h3>
    <div class="form-group">
      <label>Author(s) *</label>
      <div class="dependencies-list">
        {store.author.map((author, index) => (
          <div class="dependency-row" key={index}>
            <input
              type="text"
              placeholder={`Author ${index + 1}`}
              value={author}
              onInput={(e) => store.author[index] = e.currentTarget.value}
            />
            <button
              type="button"
              class="btn-remove"
              onClick={() => store.dependencies.splice(index, 1)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        class="btn-add"
        onClick={() => store.author.push("")}
      >
        + Add Author
      </button>
    </div>
    <div class="form-group">
      <label>License *</label>
      <select
        value={store.license}
        onChange={(e) => (store.license = e.currentTarget.value)}
      >
        {CommonLicenses.map((lic) => (
          <option key={lic} value={lic}>
            {lic}
          </option>
        ))}
      </select>
    </div>
    <div class="form-group">
      <label>Homepage</label>
      <input
        type="url"
        placeholder="https://github.com/owner/repo"
        value={store.homepage}
        onInput={(e) => (store.homepage = e.currentTarget.value)}
      />
    </div>
    <div class="form-group">
      <label>Icon URL</label>
      <input
        type="url"
        placeholder="https://example.com/icon.png"
        value={store.iconUrl}
        onInput={(e) => (store.iconUrl = e.currentTarget.value)}
      />
      <small>URL to icon image (PNG, recommended 160x160)</small>
    </div>
  </section>
)
