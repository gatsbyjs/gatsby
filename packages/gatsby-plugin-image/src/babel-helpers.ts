import { murmurhash } from "babel-plugin-remove-graphql-queries/murmur"
import { JSXOpeningElement } from "@babel/types"
import { NodePath } from "@babel/core"
import { getAttributeValues } from "babel-jsx-utils"

export const SHARP_ATTRIBUTES = new Set([
  `src`,
  `layout`,
  `maxWidth`,
  `maxHeight`,
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
  `width`,
  `height`,
  `placeholder`,
  `tracedSVGOptions`,
  `webP`,
  `outputPixelDensities`,
  `sizes`,
  `fit`,
  `background`,
  `base64Width`,
  `jpegProgressive`,
  `toFormatBase64`,
  `trim`,
  `srcSetBreakpoints`,
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
