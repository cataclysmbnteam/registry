/// <reference lib="dom" />
/**
 * Attribution form section for author, license, and homepage.
 */

import { CommonLicenses } from "./types.ts"
import { store } from "./store.ts"

export const AttributionSection = () => (
  <section>
    <h3>Attribution</h3>
    <fieldset>
      <label>Author *</label>
      <input
        type="text"
        placeholder="Your Name"
        value={store.author}
        onInput={(e) => (store.author = e.currentTarget.value)}
      />
    </fieldset>
    <fieldset>
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
    </fieldset>
    <fieldset>
      <label>Homepage</label>
      <input
        type="url"
        placeholder="https://github.com/owner/repo"
        value={store.homepage}
        onInput={(e) => (store.homepage = e.currentTarget.value)}
      />
    </fieldset>
  </section>
)
