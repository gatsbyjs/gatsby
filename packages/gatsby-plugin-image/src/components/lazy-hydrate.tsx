import React, { MutableRefObject } from "react"
import { hydrate, render } from "react-dom"
import { GatsbyImageProps } from "./gatsby-image.browser"
import { LayoutWrapper } from "./layout-wrapper"
import { Placeholder } from "./placeholder"
import { MainImageProps, MainImage } from "./main-image"
import { getMainProps, getPlaceholderProps } from "./hooks"
import { ReactElement } from "react"

type LazyHydrateProps = Omit<GatsbyImageProps, "as" | "style" | "className"> & {
  isLoading: boolean
  isLoaded: boolean // alwaystype SetStateAction<S> = S | ((prevState: S) => S);
  toggleIsLoaded: (toggle: boolean) => void
  ref: MutableRefObject<HTMLImageElement | undefined>
}

export function lazyHydrate(
  {
    image,
    loading,
    isLoading,
    isLoaded,
    toggleIsLoaded,
    ref,
    imgClassName,
    imgStyle = {},
    objectPosition,
    backgroundColor,
    objectFit = `cover`,
    ...props
  }: LazyHydrateProps,
  root: MutableRefObject<HTMLElement | undefined>,
  hydrated: MutableRefObject<boolean>,
  forceHydrate: MutableRefObject<boolean>
): (() => void) | null {
  const {
    width,
    height,
    layout,
    images,
    placeholder,
    backgroundColor: wrapperBackgroundColor,
  } = image

  const cacheKey = JSON.stringify(images)

  imgStyle = {
    objectFit,
    objectPosition,
    backgroundColor,
    ...imgStyle,
  }

  const component = (
    <LayoutWrapper layout={layout} width={width} height={height}>
      <Placeholder
        {...getPlaceholderProps(
          placeholder,
          isLoaded,
          layout,
          width,
          height,
          wrapperBackgroundColor,
          objectFit,
          objectPosition
        )}
      />

      <MainImage
        {...(props as Omit<MainImageProps, "images" | "fallback">)}
        width={width}
        height={height}
        className={imgClassName}
        {...getMainProps(
          isLoading,
          isLoaded,
          images,
          loading,
          toggleIsLoaded,
          cacheKey,
          ref,
          imgStyle
        )}
      />
    </LayoutWrapper>
  )

  if (root.current) {
    // Force render to mitigate "Expected server HTML to contain a matching" in develop
    const doRender = hydrated.current || forceHydrate.current ? render : hydrate
    doRender(component, root.current)
    hydrated.current = true
  }

  return (): void => {
    if (root.current) {
      render((null as unknown) as ReactElement, root.current)
    }
  }
}
