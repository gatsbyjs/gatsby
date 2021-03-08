import { getImageData } from "gatsby-plugin-image"

import { createUrl } from "./extend-node-type"

export function useContentfulImage({ image, formats = [`auto`], ...props }) {
  return getImageData({
    baseUrl: image.url,
    sourceWidth: image.width,
    sourceHeight: image.height,
    urlBuilder: createUrl,
    pluginName: `gatsby-source-contentful`,
    formats,
    ...props,
  })
}
