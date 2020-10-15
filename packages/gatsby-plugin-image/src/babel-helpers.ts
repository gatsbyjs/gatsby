import { murmurhash } from "babel-plugin-remove-graphql-queries/murmur"
import { JSXOpeningElement } from "@babel/types"
import { NodePath } from "@babel/core"
import { getAttributeValues } from "babel-jsx-utils"

export const SHARP_ATTRIBUTES = new Set([
  `src`,
  `quality`,
  `jpegQuality`,
  `pngQuality`,
  `webpQuality`,
  `grayscale`,
  `toFormat`,
  `cropFocus`,
  `pngCompressionSpeed`,
  `rotate`,
  `duotone`,
  `layout`,
  `maxWidth`,
  `maxHeight`,
  `srcSetBreakpoints`,
  `fit`,
  `background`,
  `width`,
  `height`,
  `tracedSVG`,
  `webP`,
])

export function evaluateImageAttributes(
  nodePath: NodePath<JSXOpeningElement>,
  onError?: (prop: string) => void
): Record<string, unknown> {
  // Only get attributes that we need for generating the images
  return getAttributeValues(nodePath, onError, SHARP_ATTRIBUTES)
}

export function hashOptions(options: unknown): string {
  return `${murmurhash(JSON.stringify(options))}`
}
