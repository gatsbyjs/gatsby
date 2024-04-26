import type { Node, GatsbyNode, NodeInput } from "gatsby";

type IRemoteFileNodeFields = {
  url: string;
  mimeType: string;
  filename: string;
  filesize?: number | undefined;
};

export type IRemoteFileNode = Record<string, unknown> &
  IRemoteFileNodeFields &
  Node;

export type IRemoteFileNodeInput = Record<string, unknown> &
  IRemoteFileNodeFields &
  NodeInput;

type IRemoteImageNodeFields = {
  width: number;
  height: number;
  placeholderUrl?: string | undefined;
};

export type IRemoteImageNode = Record<string, unknown> &
  IRemoteImageNodeFields &
  IRemoteFileNode;

export type IRemoteImageNodeInput = Record<string, unknown> &
  IRemoteImageNodeFields &
  IRemoteFileNodeInput;

type GraphqlType<T> = T extends number
  ? "Int" | "Float"
  : T extends boolean
    ? "Boolean"
    : string;

export type IGraphQLFieldConfigDefinition<
  TSource,
  R,
  TArgs = Record<string, unknown>,
> = {
  type: string;
  description?: string | undefined;
  args?:
    | {
        [Property in keyof TArgs]:
          | GraphqlType<TArgs[Property]>
          | {
              type: GraphqlType<TArgs[Property]>;
              description?: string | undefined;
              defaultValue?: TArgs[Property] | undefined;
            };
      }
    | undefined;
  resolve(source: TSource, args: TArgs): R;
};

export type SchemaBuilder = Parameters<
  NonNullable<GatsbyNode["createSchemaCustomization"]>
>[0]["schema"];

export type ImageFit = import("sharp").FitEnum[keyof import("sharp").FitEnum];
export type ImageFormat = "jpg" | "png" | "webp" | "avif" | "auto";
export type ImageLayout = "fixed" | "constrained" | "fullWidth";
export type ImageCropFocus =
  | "center"
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "entropy"
  | "edges"
  | "faces";

export type CalculateImageSizesArgs = {
  fit: ImageFit;
  layout: ImageLayout;
  outputPixelDensities: Array<number>;
  breakpoints?: Array<number> | undefined;
  aspectRatio?: number | undefined;
  width: number | undefined;
  height: number | undefined;
};

export function isImage(node: {
  mimeType: IRemoteFileNode["mimeType"];
}): node is IRemoteImageNode {
  if (!node.mimeType) {
    throw new Error(
      "RemoteFileNode does not have a mimeType. The field is required.",
    );
  }

  return (
    node.mimeType.startsWith("image/") && node.mimeType !== "image/svg+xml"
  );
}

export type ImageCdnTransformArgs = {
  format: string;
  cropFocus?: ImageCropFocus | Array<ImageCropFocus> | undefined;
  quality: number;
  width: number | undefined;
  height: number | undefined;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type CdnSourceImage = {
  url: string;
  mimeType: string;
  filename: string;
  internal: { contentDigest: string };
};

export type ImageCdnSourceImage = CdnSourceImage;

/**
 * The function is used to optimize image delivery by generating URLs that leverage CDN capabilities
 * @param {ImageCdnSourceImage} source - An object representing the source image, including properties like
 * URL, filename, and MIME type.
 * @param {ImageCdnTransformArgs} imageArgs - An object containing arguments for image transformation, such as
 * format, quality, and crop focus.
 * @param {string} pathPrefix - This parameter allows for an optional path prefix in the generated relative URL,
 * primarily influencing the location of the image transformation endpoint, particularly if not in the domain root.
 * @returns {string} A string representing the generated URL for the image on the CDN. Ideally it is relative url
 * (starting with `/`, resulting in usage of same domain as site itself), but it can also be absolute URL.
 */
export type ImageCdnUrlGeneratorFn = (
  source: ImageCdnSourceImage,
  imageArgs: ImageCdnTransformArgs,
  pathPrefix: string,
) => string;

export type FileCdnSourceImage = CdnSourceImage;

/**
 * The function is used to optimize image delivery by generating URLs that leverage CDN capabilities
 * @param {FileCdnSourceImage} source - An object representing the source file, including properties like
 * URL, filename, and MIME type.
 * @param {string} pathPrefix - A string representing the path prefix to be prepended to the
 * generated URL.
 * @returns {string} A string representing the generated URL for the file on the CDN. Ideally it is relative url
 * (starting with `/`, resulting in usage of same domain as site itself), but it can also be absolute URL.
 */
export type FileCdnUrlGeneratorFn = (
  source: FileCdnSourceImage,
  pathPrefix: string,
) => string;
