import { Node } from "gatsby"
import { IGatsbyImageData, ImageFormat } from "gatsby-plugin-image"
import {
  FieldsType,
  LocaleCode,
  EntrySys,
  Metadata,
  EntryLink,
  EntryFields,
} from "contentful"

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
  contentType?: string
  firstPublishedAt: string
  publishedAt: string
  publishedVersion: number
  locale: string
}

export interface ILocalizedField {
  [locale: string]: unknown
}

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

interface IContentfulEntity extends Node {
  id: string
  sys: IContentfulSys
  contentfulMetadata: IContentfulMetadata
}

export interface IContentfulEntry extends IContentfulEntity {
  linkedFrom: {
    [referenceId: string]: Array<string>
  }
}

export interface IContentfulAsset extends IContentfulEntity {
  gatsbyImageData?: IGatsbyImageData
  localFile?: {
    excludeByMimeTypes?: Array<string>
    maxFileSizeBytes?: number
    requestConcurrency?: number
  }
  title: string
  description: string
  contentType: string
  mimeType: string
  filename: string
  url: string
  size?: number
  width?: number
  height?: number
  fields?: { localFile?: string }
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

export type contentfulImageApiBackgroundColor = `rgb:${string}`

type contentfulCropFocus =
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

export interface IContentfulImageAPITransformerOptions {
  cornerRadius?: number | "max"
  width?: number
  height?: number
  toFormat?: ImageFormat | "auto" | "jpg" | "png" | "webp" | "gif" | "avif"
  jpegProgressive?: number
  quality?: IntRange<0, 100>
  resizingBehavior?: "pad" | "fill" | "scale" | "crop" | "thumb"
  cropFocus?: contentfulCropFocus
  backgroundColor?: string
  placeholder?: "dominantColor" | "blurred" | "tracedSVG"
  blurredOptions?: { width?: number; toFormat: ImageFormat }
  tracedSVGOptions?: { [key: string]: unknown }
}

export interface IContentfulImageAPIUrlBuilderOptions {
  width?: number
  height?: number
  toFormat?: ImageFormat | "auto" | "jpg" | "png" | "webp" | "gif" | "avif"
  resizingBehavior?: "pad" | "fill" | "scale" | "crop" | "thumb"
  background?: contentfulImageApiBackgroundColor
  quality?: IntRange<0, 100>
  jpegProgressive?: number
  cropFocus?: contentfulCropFocus
  cornerRadius?: number | "max"
}

export interface IEntryWithAllLocalesAndWithoutLinkResolution<
  Fields extends FieldsType,
  Locales extends LocaleCode
> {
  sys: EntrySys
  metadata: Metadata
  fields: {
    [FieldName in keyof Fields]: {
      [LocaleName in Locales]?: Fields[FieldName] extends EntryFields.Link<any>
        ? EntryLink
        : Fields[FieldName] extends Array<EntryFields.Link<any>>
        ? Array<EntryLink>
        : Fields[FieldName]
    }
  }
}
