import { getImageData, IGatsbyImageData } from "gatsby-plugin-image"
import { useMemo } from "react"

import { createUrl } from "./image-helpers"
import type {
  IContentfulAsset,
  IContentfulImageAPITransformerOptions,
} from "./types/contentful"

interface IUseContentfulImageArgs {
  image: IContentfulAsset
  [key: string]: unknown
}

export function useContentfulImage({
  image,
  ...props
}: IUseContentfulImageArgs): IGatsbyImageData {
  return useMemo(
    () =>
      getImageData<IContentfulImageAPITransformerOptions>({
        baseUrl: image.url,
        sourceWidth: image.width,
        sourceHeight: image.height,
        backgroundColor: undefined,
        urlBuilder: ({ baseUrl, width, height, options, format }) =>
          createUrl(baseUrl, {
            ...options,
            height,
            width,
            toFormat: format,
          }),
        pluginName: `gatsby-source-contentful`,
        ...props,
      }),
    [image.url, image.width, image.height, props]
  )
}
