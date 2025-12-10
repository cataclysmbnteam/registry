export const layout = undefined

export default (
  { title, description, siteName, siteDescription, children, url }: Lume.Data,
  _helpers: Lume.Helpers,
) => {
  // Determine page type for search indexing
  const isMod = url?.startsWith("/mods/") && url !== "/mods/"
  const isDoc = url?.startsWith("/docs/")
  // Only index mod and doc pages, not index/list pages
  const shouldIndex = isMod || isDoc
  // Determine search container ID based on section
  const searchId = isDoc ? "docs-search" : "search"

  // Theme initialization script (runs immediately to prevent flash)
  const themeScript = `
    const changeHighlight = () => {
      const light = document.getElementById("highlight-theme-light")
      if (light) light.disabled = theme === "dark"
      const dark = document.getElementById("highlight-theme-dark")
      if (dark) dark.disabled = theme === "light"
    }
    let theme = localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    changeHighlight()
    document.documentElement.dataset.theme = theme
    function changeTheme() {
      theme = theme === "dark" ? "light" : "dark"
      localStorage.setItem("theme", theme)
      document.documentElement.dataset.theme = theme
      changeHighlight()
    }
    function toggleMenu() {
      const menu = document.getElementById("nav-menu")
      const hamburger = document.querySelector(".hamburger")
      if (menu) {
        menu.classList.toggle("open")
        hamburger?.classList.toggle("open")
      }
    }
    document.addEventListener('DOMContentLoaded', () => {
      const btn = document.getElementById('back-to-top');
      if (btn) {
        btn.addEventListener('click', () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
    });
  `

  return (
    <>
      {{ __html: "<!DOCTYPE html>" }}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{title} | {siteName}</title>
          <meta name="description" content={description || siteDescription} />
          {/* Theme color meta tags for browser chrome */}
          <meta name="supported-color-schemes" content="light dark" />
          <meta
            name="theme-color"
            content="hsl(220, 20%, 100%)"
            media="(prefers-color-scheme: light)"
          />
          <meta
            name="theme-color"
            content="hsl(220, 20%, 10%)"
            media="(prefers-color-scheme: dark)"
          />
          {/* Pagefind section filter */}
          {isMod && <meta data-pagefind-filter="section:mod" />}
          {isDoc && <meta data-pagefind-filter="section:docs" />}
          {/* Theme script - must run before body to prevent flash */}
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
          {/* Our styles (imports @lumeland/ds) */}
          <link rel="stylesheet" href="/assets/styles.css" />
          <link
            id="highlight-theme-light"
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.6.0/build/styles/github.min.css"
          />
          <link
            id="highlight-theme-dark"
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.6.0/build/styles/dark.min.css"
          />
        </head>
        <body data-instant-intensity="viewport-all">
          {/* Skip to main content link for accessibility */}
          <a href="#main-content" class="skip-link">Skip to content</a>
          <nav data-pagefind-ignore>
            <ul>
              <li class="logo">
                <a href="/">Home</a>
              </li>
              <li class="nav-menu-wrapper">
                <ul class="nav-menu" id="nav-menu">
                  <li>
                    <a href="/mods/">Mods</a>
                  </li>
                  <li>
                    <a href="/docs/">Docs</a>
                  </li>
                  <li>
                    <a href="/api/">API</a>
                  </li>
                </ul>
              </li>
              <div
                style={{
                  "margin-left": "auto",
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <li class="nav-search" id={searchId}></li>
                <li class="btn-add-wrapper">
                  <a href="/docs/generator/" class="btn-add">Add Mod</a>
                </li>
                <li class="theme-toggle">
                  <button
                    type="button"
                    aria-label="Toggle dark/light theme"
                    class="btn-theme"
                    onclick="changeTheme()"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      width="20"
                      height="20"
                      fill="currentColor"
                    >
                      <path d="M14.53 10.53a7 7 0 0 1-9.058-9.058A7.003 7.003 0 0 0 8 15a7.002 7.002 0 0 0 6.53-4.47Z" />
                    </svg>
                  </button>
                </li>
                <li class="hamburger-wrapper">
                  <button
                    type="button"
                    aria-label="Toggle menu"
                    class="hamburger"
                    onclick="toggleMenu()"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      width="24"
                      height="24"
                      fill="currentColor"
                    >
                      <path d="M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75Zm0 5A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75ZM1.75 12h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5Z" />
                    </svg>
                  </button>
                </li>
              </div>
            </ul>
          </nav>

          <main id="main-content" data-pagefind-body={shouldIndex ? "" : undefined}>
            {children}
          </main>

          <footer data-pagefind-ignore>
            <p>
              <a href="https://github.com/cataclysmbnteam/registry">BN Mod Registry</a>
              {" · "}
              <a href="https://github.com/cataclysmbnteam/Cataclysm-BN">
                Play Cataclysm: Bright Nights
              </a>
              {" · "}
              <a href="https://discord.gg/XW7XhXuZ89">Discord</a>
            </p>
            <p>
              2025 © Cataclysm: Bright Nights Contributors
            </p>
          </footer>

          {/* Back to Top Button */}
          <button
            id="back-to-top"
            class="back-to-top"
            type="button"
            aria-label="Back to top"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              width="24"
              height="24"
              fill="currentColor"
            >
              <path d="M3.47 7.78a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018L9 4.81v7.44a.75.75 0 0 1-1.5 0V4.81L4.53 7.78a.75.75 0 0 1-1.06 0Z" />
            </svg>
          </button>

          {/* instant.page - preload pages on hover for instant navigation */}
          <script
            src="//instant.page/5.2.0"
            type="module"
            integrity="sha384-jnZyxPjiipYXnSU0ygqeac2q7CVYMbh84q0uHVRRxEtvFPiQYbXWUorga2aqZJ0z"
          />
        </body>
      </html>
    </>
  )
}
