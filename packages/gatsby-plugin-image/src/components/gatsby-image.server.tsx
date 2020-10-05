import React, { ElementType, FunctionComponent, CSSProperties } from "react"
import { GatsbyImageProps } from "./gatsby-image.browser"
import { getWrapperProps, getMainProps, getPlaceHolderProps } from "./hooks"
import { Placeholder } from "./placeholder"
import { MainImage, MainImageProps } from "./main-image"
import { LayoutWrapper } from "./layout-wrapper"

const removeNewLines = (str: string): string => str.replace(/\n/g, ``)

export const GatsbyImageHydrator: FunctionComponent<{
  as?: ElementType
  style?: CSSProperties
  className?: string
}> = function GatsbyImageHydrator({ as: Type = `div`, children, ...props }) {
  return <Type {...props}>{children}</Type>
}

export const GatsbyImage: FunctionComponent<GatsbyImageProps> = function GatsbyImage({
  as,
  className,
  style,
  placeholder,
  images,
  width,
  height,
  layout = `fixed`,
  loading = `lazy`,
  ...props
}) {
  const { style: wStyle, className: wClass, ...wrapperProps } = getWrapperProps(
    width,
    height,
    layout
  )

  const cleanedImages: GatsbyImageProps["images"] = {
    fallback: undefined,
    sources: [],
  }
  if (images.fallback) {
    cleanedImages.fallback = {
      src: images.fallback.src,
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

  return (
    <GatsbyImageHydrator
      {...wrapperProps}
      as={as}
      style={{
        ...wStyle,
        ...style,
      }}
      className={`${wClass}${className ? ` ${className}` : ``}`}
    >
      <LayoutWrapper layout={layout} width={width} height={height}>
        {placeholder && <Placeholder {...getPlaceHolderProps(placeholder)} />}
        <MainImage
          data-gatsby-image-ssr=""
          {...(props as Omit<MainImageProps, "images" | "fallback">)}
          // When eager is set we want to start the isLoading state on true (we want to load the img without react)
          {...getMainProps(loading === `eager`, false, cleanedImages, loading)}
        />
      </LayoutWrapper>
    </GatsbyImageHydrator>
  )
}
