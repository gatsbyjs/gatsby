import React, { FunctionComponent } from "react"
import { generateImageData, IGatsbyImageHelperArgs } from "../image-utils"
import { GatsbyImage, GatsbyImageProps } from "./gatsby-image.browser"

export type CdnImageProps = Omit<GatsbyImageProps, "image"> &
  IGatsbyImageHelperArgs

export const getCdnImage = (
  Component: FunctionComponent<GatsbyImageProps>
): FunctionComponent<CdnImageProps> =>
  function CdnImage({
    pluginName,
    generateImageSource,
    layout,
    formats,
    filename,
    placeholderURL,
    width,
    height,
    maxWidth,
    maxHeight,
    sizes,
    reporter,
    sourceMetadata,
    fit,
    options,
    ...props
  }: CdnImageProps): JSX.Element {
    if (!(width || maxWidth) || !(height || maxHeight)) {
      console.warn(
        `[${pluginName}] Error displaying ${filename}. You must specify both width (or maxWidth) and height (or maxHeight)`
      )
    }

    return (
      <Component
        {...props}
        image={generateImageData({
          pluginName,
          generateImageSource,
          layout,
          formats,
          filename,
          placeholderURL,
          width,
          height,
          maxWidth,
          maxHeight,
          sizes,
          reporter,
          sourceMetadata,
          fit,
          options,
        })}
      />
    )
  }

export const CdnImage: FunctionComponent<CdnImageProps> = getCdnImage(
  GatsbyImage
)
