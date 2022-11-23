import { murmurhash } from "gatsby-core-utils/murmurhash"
import { JSXOpeningElement } from "@babel/types"
import { NodePath } from "@babel/core"
import { getAttributeValues } from "babel-jsx-utils"
import camelCase from "camelcase"

export const SHARP_ATTRIBUTES = new Set([
  `src`,
  `layout`,
  `formats`,
  `aspectRatio`,
  `quality`,
  `avifOptions`,
  `jpgOptions`,
  `pngOptions`,
  `webpOptions`,
  `blurredOptions`,
  `transformOptions`,
  `width`,
  `height`,
  `placeholder`,
  `tracedSVGOptions`,
  `sizes`,
  `backgroundColor`,
  `breakpoints`,
  `outputPixelDensities`,
])

export function normalizeProps(
  props: Record<string, unknown>
): Record<string, unknown> {
  const out = {
    ...props,
  }

  if (out.layout) {
    out.layout = camelCase(out.layout as string)
  }

  if (out.placeholder) {
    out.placeholder = camelCase(out.placeholder as string)
    if (out.placeholder === `tracedSvg`) {
      out.placeholder = `tracedSVG`
    }
  }

  if (Array.isArray(out.formats)) {
    out.formats = out.formats.map((format: string) => format.toLowerCase())
  }

  return out
}

export function evaluateImageAttributes(
  nodePath: NodePath<JSXOpeningElement>,
  onError?: (prop: string, nodePath: NodePath<any>) => void
): Record<string, unknown> {
  // Only get attributes that we need for generating the images
  return normalizeProps(getAttributeValues(nodePath, onError, SHARP_ATTRIBUTES))
}

export function hashOptions(options: unknown): string {
  return `${murmurhash(JSON.stringify(options), 0)}`
}
