/// <reference lib="dom" />
/**
 * Autoupdate form section for automatic version updates.
 */

import { store } from "./store.ts"

export const AutoupdateSection = () => (
  <section>
    <h3>Autoupdate</h3>
    <fieldset>
      <label>
        <input
          type="checkbox"
          checked={store.enableAutoupdate}
          onChange={(e) => (store.enableAutoupdate = e.currentTarget.checked)}
        />{" "}
        Enable Autoupdate
      </label>
    </fieldset>
    {store.enableAutoupdate && (
      <>
        <fieldset>
          <label>Autoupdate Type</label>
          <select
            value={store.autoupdateType}
            onChange={(
              e,
            ) => (store.autoupdateType = e.currentTarget.value)}
          >
            <option value="commit">Commit (track branch)</option>
            <option value="tag">Tag (track releases)</option>
          </select>
        </fieldset>
        {store.autoupdateType === "commit" && (
          <fieldset>
            <label>Branch</label>
            <input
              type="text"
              placeholder="main"
              value={store.autoupdateBranch}
              onInput={(e) => (store.autoupdateBranch = e.currentTarget.value)}
            />
          </fieldset>
        )}
      </>
    )}
  </section>
)
