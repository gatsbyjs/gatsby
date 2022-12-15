import { Node } from "gatsby"
import { ImageFormat } from "gatsby-plugin-image"

// Generic Types
export interface IContentfulContentType {
  id: string
  name: string
  displayField: string
  description: string
}
export interface IContentfulSys {
  id: string
  type: string
  spaceId: string
  environmentId: string
  contentType: string
  firstPublishedAt: string
  publishedAt: string
  publishedVersion: number
  locale: string
}

// export interface IContentfulTag {
//   name: string
//   contentful_id: string
//   id: string
// }

interface IContentfulMetadata {
  tags: Array<string>
}

interface IContentfulLinkSys {
  id: string
  linkType: string
}
export interface IContentfulLink {
  sys: IContentfulLinkSys
}

export interface IContentfulEntity extends Node {
  id: string
  sys: IContentfulSys
  metadata: IContentfulMetadata
}

export type IContentfulEntry = IContentfulEntity

export interface IContentfulAsset extends IContentfulEntity {
  // @todo this field type might be defined by Gatsby already?
  gatsbyImageData: unknown
  // @todo this field type might be defined by Gatsby already?
  downloadLocal?: string
  title?: string
  description?: string
  contentType: string
  mimeType: string
  filename: string
  url: string
  size: number
  width: number
  height: number
  fields: { localFile?: string }
}

// Image API
type Enumerate<
  N extends number,
  Acc extends Array<number> = []
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>

type IntRange<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>

type contentfulImageApiBackgroundColor = `rgb:${string}`

export interface IContentfulImageAPIUrlBuilderOptions {
  cornerRadius?: number | "max"
  width?: number
  height?: number
  toFormat?: ImageFormat | "auto" | "jpg" | "png" | "webp" | "gif" | "avif"
  jpegProgressive?: number
  quality?: IntRange<0, 100>
  resizingBehavior?: "pad" | "fill" | "scale" | "crop" | "thumb"
  cropFocus?:
    | "top"
    | "top_left"
    | "top_right"
    | "bottom"
    | "bottom_left"
    | "bottom_right"
    | "right"
    | "left"
    | "face"
    | "faces"
    | "center"
  background?: contentfulImageApiBackgroundColor
}
