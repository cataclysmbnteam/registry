/**
 * Utilities for handling CDDA/BN color codes and converting them to HTML.
 * Reference: https://docs.cataclysmbn.org/mod/json/reference/graphics/color/
 */

/**
 * Color mapping from CDDA/BN color names to CSS hex colors.
 * Based on the official color documentation.
 */
export const ColorMap: Record<string, string> = {
  // Base colors
  black: "#000000",
  red: "#ff0000",
  green: "#006e00",
  brown: "#5c3317",
  blue: "#0000c8",
  magenta: "#8b3a62",
  pink: "#8b3a62", // Alias for magenta
  cyan: "#0096b4",

  // Light colors
  light_gray: "#969696",
  ltgray: "#969696", // Deprecated alias
  dark_gray: "#636363",
  dkgray: "#636363", // Deprecated alias
  light_red: "#ff9696",
  ltred: "#ff9696", // Deprecated alias
  light_green: "#00ff00",
  ltgreen: "#00ff00", // Deprecated alias
  light_yellow: "#ffff00",
  yellow: "#ffff00", // Alias
  ltyellow: "#ffff00", // Deprecated alias
  light_blue: "#6464ff",
  ltblue: "#6464ff", // Deprecated alias
  light_magenta: "#fe00fe",
  ltmagenta: "#fe00fe", // Deprecated alias
  light_cyan: "#00f0ff",
  ltcyan: "#00f0ff", // Deprecated alias
  white: "#ffffff",

  // Unset color
  unset: "#969696",
}

/**
 * Parse a CDDA/BN color name and return the CSS hex color.
 * Handles prefixes (c_, i_, h_) and foreground_background format.
 *
 * @param colorName - Color name from the tag (e.g., "red", "c_red", "light_green")
 * @returns CSS hex color or default gray if not found
 */
export const parseColorName = (colorName: string): string => {
  // Remove optional prefix (c_, i_, h_)
  let name = colorName.replace(/^[cih]_/, "")

  // Handle foreground_background format - only use foreground
  // e.g., "dark_gray_white" -> "dark_gray"
  // But be careful not to split "light_gray" or "dark_gray"
  const compoundColors = [
    "light_gray",
    "dark_gray",
    "light_red",
    "light_green",
    "light_yellow",
    "light_blue",
    "light_magenta",
    "light_cyan",
  ]

  if (!compoundColors.includes(name)) {
    // Check if this is a foreground_background format
    const parts = name.split("_")
    if (parts.length > 1) {
      // Try to find a compound color match first
      for (let i = parts.length - 1; i >= 1; i--) {
        const potential = parts.slice(0, i).join("_")
        if (ColorMap[potential]) {
          name = potential
          break
        }
      }
      // If no compound match, just use first part
      if (!ColorMap[name] && parts.length > 0) {
        name = parts[0]
      }
    }
  }

  return ColorMap[name] ?? ColorMap.unset
}

/**
 * Convert CDDA/BN color codes in text to HTML spans with inline styles.
 * Color codes look like: <color_cyan>text</color> or <color_red>text</color_red>
 *
 * @param text - Text with potential color codes
 * @returns Text with color codes converted to HTML spans
 */
export const colorCodesToHtml = (text: string): string => {
  // Match color tags: <color_NAME>content</color> or <color_NAME>content</color_NAME>
  // Handle nested tags by processing outermost first
  let result = text

  // Pattern matches: <color_NAME>...</color> or <color_NAME>...</color_NAME>
  // Use a non-greedy match for the content
  const pattern = /<color_([^>]+)>([\s\S]*?)<\/color(?:_\1)?>/g

  // Keep replacing until no more matches (handles nested tags)
  let previousResult = ""
  while (result !== previousResult) {
    previousResult = result
    result = result.replace(pattern, (_match, colorName, content) => {
      const color = parseColorName(colorName)
      return `<span style="color: ${color}">${content}</span>`
    })
  }

  return result
}

/**
 * Strip CDDA/BN color codes from text.
 * Color codes look like: <color_cyan>text</color> or <color_red>text</color_red>
 *
 * @param text - Text with potential color codes
 * @returns Text with color codes removed
 */
export const stripColorCodes = (text: string): string => text.replace(/<\/?color[^>]*>/g, "").trim()
