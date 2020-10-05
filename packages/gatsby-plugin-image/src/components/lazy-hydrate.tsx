import { createElement, RefObject, MutableRefObject } from "react"
import { hydrate, render } from "react-dom"
import { GatsbyImageProps } from "./gatsby-image.browser"
import { LayoutWrapper } from "./layout-wrapper"
import { Placeholder } from "./placeholder"
import { MainImageProps, MainImage } from "./main-image"
import {
  getMainProps,
  getPlaceHolderProps,
  hasNativeLazyLoadSupport,
  hasImageLoaded,
} from "./hooks"

type LazyHydrateProps = Omit<GatsbyImageProps, "as" | "style" | "className"> & {
  isLoading: boolean
  isLoaded: boolean // alwaystype SetStateAction<S> = S | ((prevState: S) => S);
  toggleIsLoaded: Function
  ref: MutableRefObject<HTMLImageElement>
}

export function lazyHydrate(
  {
    layout = `fixed`,
    width,
    height,
    placeholder,
    images,
    loading,
    isLoading,
    isLoaded,
    toggleIsLoaded,
    ref,
    ...props
  }: LazyHydrateProps,
  root: RefObject<HTMLElement>,
  hydrated: MutableRefObject<boolean>
) {
  if (!root.current) {
    return
  }

  const hasSSRHtml = root.current.querySelector(`[data-gatsby-image-ssr]`)
  // On first server hydration do nothing
  if (hasNativeLazyLoadSupport && hasSSRHtml && !hydrated.current) {
    return
  }

  const cacheKey = JSON.stringify(images)
  const hasLoaded = !hydrated.current && hasImageLoaded(cacheKey)

  const component = (
    <LayoutWrapper layout={layout} width={width} height={height}>
      {!hasLoaded && placeholder && (
        <Placeholder {...getPlaceHolderProps(placeholder)} />
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

  return () => {
    if (root.current) {
      render(null, root.current)
    }
  }
}
