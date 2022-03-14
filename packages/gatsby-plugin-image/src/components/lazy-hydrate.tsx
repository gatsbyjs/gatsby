/* global HAS_REACT_18 */
import React, { MutableRefObject } from "react"
import { GatsbyImageProps } from "./gatsby-image.browser"
import { LayoutWrapper } from "./layout-wrapper"
import { Placeholder } from "./placeholder"
import { MainImageProps, MainImage } from "./main-image"
import { getMainProps, getPlaceholderProps } from "./hooks"
import { ReactElement } from "react"
import type { Root } from "react-dom/client"

type LazyHydrateProps = Omit<GatsbyImageProps, "as" | "style" | "className"> & {
  isLoading: boolean
  isLoaded: boolean // alwaystype SetStateAction<S> = S | ((prevState: S) => S);
  toggleIsLoaded: (toggle: boolean) => void
  ref: MutableRefObject<HTMLImageElement | undefined>
}

let reactRender
let reactHydrate
if (HAS_REACT_18) {
  const reactDomClient = require(`react-dom/client`)
  reactRender = (
    Component: React.ReactChild | Iterable<React.ReactNode>,
    el: ReactDOM.Container,
    root: Root
  ): Root => {
    if (!root) {
      root = reactDomClient.createRoot(el)
    }

    root.render(Component)

    return root
  }
  reactHydrate = (
    Component: React.ReactChild | Iterable<React.ReactNode>,
    el: ReactDOM.Container
  ): Root => reactDomClient.hydrateRoot(el, Component)
} else {
  const reactDomClient = require(`react-dom`)
  reactRender = (
    Component: React.ReactChild | Iterable<React.ReactNode>,
    el: ReactDOM.Container
  ): void => {
    reactDomClient.render(Component, el)
  }
  reactHydrate = reactDomClient.hydrate
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
  forceHydrate: MutableRefObject<boolean>,
  reactRootRef: MutableRefObject<Root>
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
    if (hydrated.current || forceHydrate.current || HAS_REACT_18) {
      reactRootRef.current = reactRender(
        component,
        root.current,
        reactRootRef.current
      )
    } else {
      reactHydrate(component, root.current)
    }
    hydrated.current = true
  }

  return (): void => {
    if (root.current) {
      reactRender(
        null as unknown as ReactElement,
        root.current,
        reactRootRef.current
      )
    }
  }
}
