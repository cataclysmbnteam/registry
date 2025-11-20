/// <reference lib="dom" />
/**
 * Status messages component for displaying errors, success, and loading states.
 */

import { store } from "./store.ts"

export const StatusMessages = () => (
  <>
    {store.error && <div>{store.error}</div>}
    {store.success && <div>{store.success}</div>}
    {store.isLoading && (
      <div>
        ⏳ {store.loadingMessage}
        {store.progress.total > 0 && (
          <div>
            <div>
              <div
                style={{
                  width: `${(store.progress.current / store.progress.total) * 100}%`,
                }}
              />
            </div>
            <div>
              {store.progress.current}/{store.progress.total} files • {store.progress.step}
            </div>
          </div>
        )}
      </div>
    )}
  </>
)
