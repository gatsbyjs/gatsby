/* global HAS_REACT_18 */
import React, { MutableRefObject } from "react"
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

let reactRender
let reactHydrate
if (HAS_REACT_18) {
  const reactDomClient = require(`react-dom/client`)
  reactRender = (
    Component: React.Component,
    el: ReactDOM.Container,
    root: any
  ): unknown => {
    if (!root) {
      root = reactDomClient.createRoot(el)
    }

    // TODO fix typing
    // @ts-ignore - React 18 typings
    root.render(Component)

    return root
  }
  reactHydrate = (
    Component: React.Component,
    el: ReactDOM.Container
  ): unknown => reactDomClient.hydrateRoot(el, Component)
} else {
  const reactDomClient = require(`react-dom`)
  reactRender = (Component: React.Component, el: ReactDOM.Container): void => {
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
  reactRootRef: MutableRefObject<unknown>
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
      // TODO fix typing
      // @ts-ignore - React 18 typings
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
