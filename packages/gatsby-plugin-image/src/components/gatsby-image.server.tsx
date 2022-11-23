import React from "react"
import { getWrapperProps, getMainProps, getPlaceholderProps } from "./hooks"
import { Placeholder } from "./placeholder"
import { MainImage, MainImageProps } from "./main-image"
import { LayoutWrapper } from "./layout-wrapper"
import PropTypes from "prop-types"
import type { FunctionComponent, WeakValidationMap } from "react"
import type { GatsbyImageProps, IGatsbyImageData } from "./gatsby-image.browser"

const removeNewLines = (str: string): string => str.replace(/\n/g, ``)

export const GatsbyImage: FunctionComponent<GatsbyImageProps> =
  function GatsbyImage({
    as = `div`,
    className,
    class: preactClass,
    style,
    image,
    loading = `lazy`,
    imgClassName,
    imgStyle,
    backgroundColor,
    objectFit,
    objectPosition,
    ...props
  }) {
    if (!image) {
      console.warn(`[gatsby-plugin-image] Missing image prop`)
      return null
    }

    if (preactClass) {
      className = preactClass
    }

    imgStyle = {
      objectFit,
      objectPosition,
      backgroundColor,
      ...imgStyle,
    }

    const {
      width,
      height,
      layout,
      images,
      placeholder,
      backgroundColor: placeholderBackgroundColor,
    } = image

    const {
      style: wStyle,
      className: wClass,
      ...wrapperProps
    } = getWrapperProps(width, height, layout)

    const cleanedImages: IGatsbyImageData["images"] = {
      fallback: undefined,
      sources: [],
    }
    if (images.fallback) {
      cleanedImages.fallback = {
        ...images.fallback,
        srcSet: images.fallback.srcSet
          ? removeNewLines(images.fallback.srcSet)
          : undefined,
      }
    }

    if (images.sources) {
      cleanedImages.sources = images.sources.map(source => {
        return {
          ...source,
          srcSet: removeNewLines(source.srcSet),
        }
      })
    }

    return React.createElement(
      as,
      {
        ...wrapperProps,
        style: {
          ...wStyle,
          ...style,
          backgroundColor,
        },
        className: `${wClass}${className ? ` ${className}` : ``}`,
      },
      <LayoutWrapper layout={layout} width={width} height={height}>
        <Placeholder
          {...getPlaceholderProps(
            placeholder,
            false,
            layout,
            width,
            height,
            placeholderBackgroundColor,
            objectFit,
            objectPosition
          )}
        />

        <MainImage
          data-gatsby-image-ssr=""
          className={imgClassName}
          {...(props as Omit<
            MainImageProps,
            "images" | "fallback" | "onError" | "onLoad"
          >)}
          // When eager is set we want to start the isLoading state on true (we want to load the img without react)
          {...getMainProps(
            loading === `eager`,
            false,
            cleanedImages,
            loading,
            imgStyle
          )}
        />
      </LayoutWrapper>
    )
  }

export const altValidator: PropTypes.Validator<string> = (
  props: GatsbyImageProps,
  propName,
  componentName,
  ...rest
): Error | undefined => {
  if (!props.alt && props.alt !== ``) {
    return new Error(
      `The "alt" prop is required in ${componentName}. If the image is purely presentational then pass an empty string: e.g. alt="". Learn more: https://a11y-style-guide.com/style-guide/section-media.html`
    )
  }

  return PropTypes.string(props, propName, componentName, ...rest)
}

export const propTypes = {
  image: PropTypes.object.isRequired,
  alt: altValidator,
} as WeakValidationMap<GatsbyImageProps>
