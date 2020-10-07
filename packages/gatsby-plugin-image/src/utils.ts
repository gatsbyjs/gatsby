import { murmurhash } from "babel-plugin-remove-graphql-queries/murmur"
import { JSXOpeningElement } from "@babel/types"
import { NodePath } from "@babel/core"
import { getAttributeValues } from "babel-jsx-utils"
import { GatsbyImageProps } from "./components/gatsby-image.browser"

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

export type Layout = "fixed" | "responsive" | "intrinsic"

export interface ICommonImageProps {
  layout?: Layout
  quality?: number
  jpegQuality?: number
  pngQuality?: number
  webpQuality?: number
  grayscale?: boolean
  duotone?: false | { highlight: string; shadow: string }
  toFormat?: "NO_CHANGE" | "JPG" | "PNG" | "WEBP"
  cropFocus?:
    | "CENTER"
    | "NORTH"
    | "NORTHEAST"
    | "EAST"
    | "SOUTHEAST"
    | "SOUTH"
    | "SOUTHWEST"
    | "WEST"
    | "NORTHWEST"
    | "ENTROPY"
    | "ATTENTION"
  pngCompressionSpeed?: number
  rotate?: number
}

export interface IFluidImageProps extends ICommonImageProps {
  maxWidth?: number
  maxHeight?: number
  srcSetBreakpoints?: Array<number>
  fit?: number
  background?: number
}

export interface IFixedImageProps extends ICommonImageProps {
  width?: number
  height?: number
}

export type AllProps = IImageOptions &
  IFluidImageProps &
  IFixedImageProps &
  Omit<GatsbyImageProps, "width" | "height"> & { src: string }

export type ImageProps = IImageOptions &
  IFluidImageProps &
  IFixedImageProps & { src: string }
export type SharpProps = Omit<ImageProps, "src" | "layout">
export type AnyImageProps = (IFluidImageProps | IFixedImageProps) &
  ICommonImageProps

export interface IImageOptions {
  webP?: boolean
  base64?: boolean
  tracedSVG?: boolean
}

export const splitProps = (
  props: AllProps
): {
  commonOptions: ICommonImageProps
  fluidOptions: IFluidImageProps
  fixedOptions: IFixedImageProps
  layout: Layout
  imageOptions: IImageOptions
  gatsbyImageProps: Omit<GatsbyImageProps, "width" | "height">
  src: string
} => {
  const {
    layout,
    quality,
    jpegQuality,
    pngQuality,
    webpQuality,
    grayscale,
    toFormat,
    cropFocus,
    pngCompressionSpeed,
    maxWidth,
    maxHeight,
    srcSetBreakpoints,
    fit,
    background,
    width,
    height,
    webP,
    base64,
    tracedSVG,
    duotone,
    rotate,
    src,
    ...gatsbyImageProps
  } = props

  const commonOptions: ICommonImageProps = {
    quality,
    jpegQuality,
    pngQuality,
    webpQuality,
    grayscale,
    toFormat,
    cropFocus,
    pngCompressionSpeed,
    duotone,
    rotate,
  }

  const fluidOptions: IFluidImageProps = {
    layout,
    maxWidth,
    maxHeight,
    srcSetBreakpoints,
    fit,
    background,
  }

  const imageOptions: IImageOptions = {
    webP,
    base64,
    tracedSVG,
  }

  const fixedOptions: IFixedImageProps = { layout, width, height }

  return {
    src,
    commonOptions,
    fluidOptions,
    fixedOptions,
    layout,
    imageOptions,
    gatsbyImageProps: { layout, ...gatsbyImageProps },
  }
}
