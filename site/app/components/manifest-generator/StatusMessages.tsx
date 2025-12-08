/// <reference lib="dom" />
/**
 * Status messages component for displaying errors, success, and loading states.
 */

import { store } from "./store.ts"

export const StatusMessages = () => (
  <>
    {store.error && <div class="status-error">{store.error}</div>}
    {store.success && <div class="status-success">{store.success}</div>}
    {store.isLoading && (
      <div class="status-loading">
        ⏳ {store.loadingMessage}
        {store.progress.total > 0 && (
          <>
            <div class="progress-bar">
              <div
                class="progress-fill"
                style={{
                  width: `${(store.progress.current / store.progress.total) * 100}%`,
                }}
              />
            </div>
            <div class="progress-text">
              {store.progress.current}/{store.progress.total} files • {store.progress.step}
            </div>
          </>
        )}
      </div>
    )}
  </>
)
