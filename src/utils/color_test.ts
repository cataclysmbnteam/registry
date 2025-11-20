/**
 * Tests for color code utilities.
 */

import { assertEquals } from "@std/assert"
import { colorCodesToHtml, ColorMap, parseColorName, stripColorCodes } from "./color.ts"

// parseColorName tests

Deno.test("parseColorName - simple color", () => {
  assertEquals(parseColorName("red"), "#ff0000")
})

Deno.test("parseColorName - color with c_ prefix", () => {
  assertEquals(parseColorName("c_red"), "#ff0000")
})

Deno.test("parseColorName - color with i_ prefix", () => {
  assertEquals(parseColorName("i_red"), "#ff0000")
})

Deno.test("parseColorName - color with h_ prefix", () => {
  assertEquals(parseColorName("h_red"), "#ff0000")
})

Deno.test("parseColorName - light color", () => {
  assertEquals(parseColorName("light_green"), "#00ff00")
})

Deno.test("parseColorName - deprecated lt prefix", () => {
  assertEquals(parseColorName("ltblue"), "#6464ff")
})

Deno.test("parseColorName - deprecated dk prefix", () => {
  assertEquals(parseColorName("dkgray"), "#636363")
})

Deno.test("parseColorName - unknown color returns default", () => {
  assertEquals(parseColorName("unknown_color"), ColorMap.unset)
})

Deno.test("parseColorName - foreground_background format", () => {
  // Should extract foreground color
  assertEquals(parseColorName("red_white"), "#ff0000")
})

// colorCodesToHtml tests

Deno.test("colorCodesToHtml - simple color tag", () => {
  const result = colorCodesToHtml("<color_red>Red text</color>")
  assertEquals(result, '<span style="color: #ff0000">Red text</span>')
})

Deno.test("colorCodesToHtml - color tag with matching close", () => {
  const result = colorCodesToHtml("<color_cyan>Cyan text</color_cyan>")
  assertEquals(result, '<span style="color: #0096b4">Cyan text</span>')
})

Deno.test("colorCodesToHtml - multiple color codes", () => {
  const result = colorCodesToHtml("<color_red>Red</color> and <color_blue>Blue</color>")
  assertEquals(
    result,
    '<span style="color: #ff0000">Red</span> and <span style="color: #0000c8">Blue</span>',
  )
})

Deno.test("colorCodesToHtml - preserves text without color codes", () => {
  const result = colorCodesToHtml("Plain text")
  assertEquals(result, "Plain text")
})

Deno.test("colorCodesToHtml - nested color codes", () => {
  const result = colorCodesToHtml(
    "<color_red>Red <color_blue>Blue inside</color_blue> back to red</color_red>",
  )
  assertEquals(
    result,
    '<span style="color: #ff0000">Red <span style="color: #0000c8">Blue inside</span> back to red</span>',
  )
})

Deno.test("colorCodesToHtml - real world example with Korean", () => {
  const result = colorCodesToHtml("날이 너무 <color_red>더워요 </color>")
  assertEquals(result, '날이 너무 <span style="color: #ff0000">더워요 </span>')
})

Deno.test("colorCodesToHtml - light colors", () => {
  const result = colorCodesToHtml("<color_light_green>Light green</color>")
  assertEquals(result, '<span style="color: #00ff00">Light green</span>')
})

// stripColorCodes tests

Deno.test("stripColorCodes - removes simple color tag", () => {
  const result = stripColorCodes("<color_red>Red text</color>")
  assertEquals(result, "Red text")
})

Deno.test("stripColorCodes - removes color tag with matching close", () => {
  const result = stripColorCodes("<color_cyan>Cyan text</color_cyan>")
  assertEquals(result, "Cyan text")
})

Deno.test("stripColorCodes - handles multiple color codes", () => {
  const result = stripColorCodes("<color_red>Red</color> and <color_blue>Blue</color>")
  assertEquals(result, "Red and Blue")
})

Deno.test("stripColorCodes - preserves text without color codes", () => {
  const result = stripColorCodes("Plain text")
  assertEquals(result, "Plain text")
})

Deno.test("stripColorCodes - trims whitespace", () => {
  const result = stripColorCodes("  <color_red>text</color>  ")
  assertEquals(result, "text")
})
