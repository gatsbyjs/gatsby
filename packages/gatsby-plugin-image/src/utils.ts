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
  aspectRatio?: number
}

export interface IFluidImageProps extends ICommonImageProps {
  fit?: number
  background?: number
}

export interface IConstrainedImageProps extends IFluidImageProps {
  width?: number
  height?: number
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
  IConstrainedImageProps &
  IFixedImageProps &
  ImageComponentProps & { src: string }

export type ImageProps = IImageOptions &
  IConstrainedImageProps &
  IFixedImageProps & { src: string }
export type SharpProps = Omit<ImageProps, "src" | "layout">
export type AnyImageProps = (IConstrainedImageProps | IFixedImageProps) &
  ICommonImageProps

export interface IImageOptions {
  webP?: boolean
  base64?: boolean
  tracedSVG?: boolean
}
