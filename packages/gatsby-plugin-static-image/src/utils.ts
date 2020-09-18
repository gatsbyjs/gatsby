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
  `fluid`,
  `fixed`,
  `maxWidth`,
  `maxHeight`,
  `srcSetBreakpoints`,
  `fit`,
  `background`,
  `width`,
  `height`,
])

export function evaluateImageAttributes(
  nodePath: NodePath<JSXOpeningElement>,
  onError?: (prop: string) => void
): Record<string, unknown> {
  return getAttributeValues(nodePath, onError, SHARP_ATTRIBUTES)
}

export function hashOptions(options: unknown): string {
  return `${murmurhash(JSON.stringify(options))}`
}
export interface ISomeGatsbyImageProps {
  fadeIn?: boolean
  durationFadeIn?: number
  title?: string
  alt?: string
  className?: string | object
  critical?: boolean
  crossOrigin?: string | boolean
  style?: object
  imgStyle?: object
  placeholderStyle?: object
  placeholderClassName?: string
  backgroundColor?: string | boolean
  onLoad?: () => void
  onError?: (event: Event) => void
  onStartLoad?: (param: { wasCached: boolean }) => void
  Tag?: string
  itemProp?: string
  loading?: `auto` | `lazy` | `eager`
  draggable?: boolean
}

export interface ICommonImageProps {
  fixed?: boolean
  fluid?: boolean
  quality?: number
  jpegQuality?: number
  pngQuality?: number
  webpQuality?: number
  grayscale?: boolean
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

export type ImageProps = IFluidImageProps | IFixedImageProps
export type AnyImageProps = (IFluidImageProps | IFixedImageProps) &
  ICommonImageProps

export type AllProps = IImageOptions &
  IFluidImageProps &
  IFixedImageProps &
  ISomeGatsbyImageProps & { src: string }

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
  isFluid: boolean
  isFixed: boolean
  imageOptions: IImageOptions
  gatsbyImageProps: ISomeGatsbyImageProps
  src: string
} => {
  const {
    fluid,
    fixed,
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
    src,
    ...gatsbyImageProps
  } = props

  const isFixed = fixed ?? true
  const isFluid = isFixed ?? !fluid

  const commonOptions: ICommonImageProps = {
    quality,
    jpegQuality,
    pngQuality,
    webpQuality,
    grayscale,
    toFormat,
    cropFocus,
    pngCompressionSpeed,
  }

  const fluidOptions: IFluidImageProps = {
    fluid: isFluid,
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

  const fixedOptions: IFixedImageProps = { fixed: isFixed, width, height }

  return {
    src,
    commonOptions,
    fluidOptions,
    fixedOptions,
    isFluid,
    isFixed,
    imageOptions,
    gatsbyImageProps,
  }
}
