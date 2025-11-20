/**
 * Shared event handler types for form components.
 * Uses Preact's JSX types for proper type checking.
 */

import type { JSX } from "preact"

export type InputHandler = JSX.GenericEventHandler<HTMLInputElement>
export type TextareaHandler = JSX.GenericEventHandler<HTMLTextAreaElement>
export type SelectHandler = JSX.GenericEventHandler<HTMLSelectElement>
