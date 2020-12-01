import { ImgHTMLAttributes, ElementType } from "react"
import { Layout } from "./image-utils"

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
