import type { Node, GatsbyNode } from "gatsby"

export interface IRemoteFileNode extends Node {
  url: string
  mimeType: string
  filename: string
  filesize?: number
}

export interface IRemoteImageNode extends IRemoteFileNode {
  width: number
  height: number
  placeholderUrl?: string
}

type GraphqlType<T> = T extends number
  ? "Int" | "Float"
  : T extends boolean
  ? "Boolean"
  : string

export interface IGraphQLFieldConfigDefinition<
  TSource,
  R,
  TArgs = Record<string, unknown>
> {
  type: string
  args?: {
    [Property in keyof TArgs]:
      | GraphqlType<TArgs[Property]>
      | {
          type: GraphqlType<TArgs[Property]>
          description?: string
          defaultValue?: TArgs[Property]
        }
  }
  resolve(source: TSource, args: TArgs): R
}

export type SchemaBuilder = Parameters<
  NonNullable<GatsbyNode["createSchemaCustomization"]>
>[0]["schema"]

export type ImageFit = import("sharp").FitEnum[keyof import("sharp").FitEnum]
export type ImageFormat = "jpg" | "png" | "webp" | "avif" | "auto"
export type ImageLayout = "fixed" | "constrained" | "fullWidth"
export type ImageCropFocus =
  | "center"
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "entropy"
  | "edges"
  | "faces"

export type WidthOrHeight =
  | { width: number; height: never }
  | { width: never; height: number }
  | { width: number; height: number }

export type CalculateImageSizesArgs = WidthOrHeight & {
  fit: ImageFit
  layout: ImageLayout
  outputPixelDensities: Array<number>
  breakpoints?: Array<number>
}

export function isImage(node: {
  mimeType: IRemoteFileNode["mimeType"]
}): node is IRemoteImageNode {
  if (!node.mimeType) {
    throw new Error(
      `RemoteFileNode does not have a mimeType. The field is required.`
    )
  }

  return node.mimeType.startsWith(`image/`) && node.mimeType !== `image/svg+xml`
}
