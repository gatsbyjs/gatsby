import { ImgHTMLAttributes, ElementType } from "react"

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

export type ImageComponentProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "placeholder" | "onLoad"
> & {
  alt: string
  as?: ElementType
  layout: Layout
  onLoad?: () => void
  onError?: () => void
  onStartLoad?: () => void
}

export type StaticImageProps = IImageOptions &
  IFluidImageProps &
  IFixedImageProps &
  ImageComponentProps & { src: string }

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
  props: StaticImageProps
): {
  commonOptions: ICommonImageProps
  fluidOptions: IFluidImageProps
  fixedOptions: IFixedImageProps
  layout: Layout
  imageOptions: IImageOptions
  gatsbyImageProps: ImageComponentProps
  src: string
} => {
  const {
    layout = `fixed`,
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
