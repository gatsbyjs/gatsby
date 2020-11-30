import React, { MutableRefObject } from "react"
import { hydrate, render } from "react-dom"
import { GatsbyImageProps } from "./gatsby-image.browser"
import { LayoutWrapper } from "./layout-wrapper"
import { Placeholder } from "./placeholder"
import { MainImageProps, MainImage } from "./main-image"
import {
  getMainProps,
  getPlaceholderProps,
  hasNativeLazyLoadSupport,
  hasImageLoaded,
} from "./hooks"
import { ReactElement } from "react"

type LazyHydrateProps = Omit<GatsbyImageProps, "as" | "style" | "className"> & {
  isLoading: boolean
  isLoaded: boolean // alwaystype SetStateAction<S> = S | ((prevState: S) => S);
  toggleIsLoaded: Function
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
    ...props
  }: LazyHydrateProps,
  root: MutableRefObject<HTMLElement | undefined>,
  hydrated: MutableRefObject<boolean>
): (() => void) | null {
  const { width, height, layout, images, placeholder, backgroundColor } = image

  if (!root.current) {
    return null
  }

  const hasSSRHtml = root.current.querySelector(`[data-gatsby-image-ssr]`)
  // On first server hydration do nothing
  if (hasNativeLazyLoadSupport() && hasSSRHtml && !hydrated.current) {
    return null
  }

  const cacheKey = JSON.stringify(images)
  const hasLoaded = !hydrated.current && hasImageLoaded(cacheKey)

  const component = (
    <LayoutWrapper layout={layout} width={width} height={height}>
      {!hasLoaded && (
        <Placeholder
          {...getPlaceholderProps(
            placeholder,
            isLoaded,
            layout,
            width,
            height,
            backgroundColor
          )}
        />
      )}
      <MainImage
        {...(props as Omit<MainImageProps, "images" | "fallback">)}
        {...getMainProps(
          isLoading,
          hasLoaded || isLoaded,
          images,
          loading,
          toggleIsLoaded,
          cacheKey,
          ref
        )}
      />
    </LayoutWrapper>
  )

  const doRender = hydrated.current ? render : hydrate
  doRender(component, root.current)
  hydrated.current = true

  return (): void => {
    if (root.current) {
      render((null as unknown) as ReactElement, root.current)
    }
  }
}
