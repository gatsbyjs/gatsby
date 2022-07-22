import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { LayoutWrapper } from "./layout-wrapper"
import { Placeholder } from "./placeholder"
import { MainImage } from "./main-image"
import {
  hasNativeLazyLoadSupport,
  getMainProps,
  getPlaceholderProps,
} from "./hooks"
import { createIntersectionObserver } from "./intersection-observer"
import type { MainImageProps } from "./main-image"
import type { GatsbyImageProps } from "./gatsby-image.browser"

type LazyHydrateProps = Omit<GatsbyImageProps, "as" | "style" | "className"> & {
  isLoading: boolean
  isLoaded: boolean
}

async function applyPolyfill(element: HTMLImageElement): Promise<void> {
  if (!(`objectFitPolyfill` in window)) {
    await import(
      // @ts-ignore typescript can't find the module for some reason ¯\_(ツ)_/¯
      /* webpackChunkName: "gatsby-plugin-image-objectfit-polyfill" */ `objectFitPolyfill`
    )
  }
  ;(window as any).objectFitPolyfill(element)
}

function toggleLoaded(
  mainImage: HTMLElement,
  placeholderImage: HTMLElement
): void {
  mainImage.style.opacity = `1`

  if (placeholderImage) {
    placeholderImage.style.opacity = `0`
  }
}

function startLoading(
  element: HTMLElement,
  cacheKey: string,
  imageCache: Set<string>,
  onStartLoad: GatsbyImageProps["onStartLoad"],
  onLoad: GatsbyImageProps["onLoad"],
  onError: GatsbyImageProps["onError"]
): () => void {
  const mainImage = element.querySelector(
    `[data-main-image]`
  ) as HTMLImageElement
  const placeholderImage = element.querySelector<HTMLElement>(
    `[data-placeholder-image]`
  )
  const isCached = imageCache.has(cacheKey)

  function onImageLoaded(e): void {
    // eslint-disable-next-line @babel/no-invalid-this
    this.removeEventListener(`load`, onImageLoaded)

    const target = e.currentTarget
    const img = new Image()
    img.src = target.currentSrc

    if (img.decode) {
      // Decode the image through javascript to support our transition
      img
        .decode()
        .then(() => {
          // eslint-disable-next-line @babel/no-invalid-this
          toggleLoaded(this, placeholderImage)
          onLoad?.({
            wasCached: isCached,
          })
        })
        .catch(e => {
          // eslint-disable-next-line @babel/no-invalid-this
          toggleLoaded(this, placeholderImage)
          onError?.(e)
        })
    } else {
      // eslint-disable-next-line @babel/no-invalid-this
      toggleLoaded(this, placeholderImage)
      onLoad?.({
        wasCached: isCached,
      })
    }
  }

  mainImage.addEventListener(`load`, onImageLoaded)

  onStartLoad?.({
    wasCached: isCached,
  })
  Array.from(mainImage.parentElement.children).forEach(child => {
    const src = child.getAttribute(`data-src`)
    const srcSet = child.getAttribute(`data-srcset`)
    if (src) {
      child.removeAttribute(`data-src`)
      child.setAttribute(`src`, src)
    }
    if (srcSet) {
      child.removeAttribute(`data-srcset`)
      child.setAttribute(`srcset`, srcSet)
    }
  })

  imageCache.add(cacheKey)

  // Load times not always fires - mostly when it's a 304
  // We check if the image is already completed and if so we trigger onload.
  if (mainImage.complete) {
    onImageLoaded.call(mainImage, {
      currentTarget: mainImage,
    })
  }

  return (): void => {
    if (mainImage) {
      mainImage.removeEventListener(`load`, onImageLoaded)
    }
  }
}

export function swapPlaceholderImage(
  element: HTMLElement,
  cacheKey: string,
  imageCache: Set<string>,
  style: React.CSSProperties,
  onStartLoad: GatsbyImageProps["onStartLoad"],
  onLoad: GatsbyImageProps["onLoad"],
  onError: GatsbyImageProps["onError"]
): () => void {
  if (!hasNativeLazyLoadSupport()) {
    let cleanup
    const io = createIntersectionObserver(() => {
      cleanup = startLoading(
        element,
        cacheKey,
        imageCache,
        onStartLoad,
        onLoad,
        onError
      )
    })
    const unobserve = io(element)

    // Polyfill "object-fit" if unsupported (mostly IE)
    if (!(`objectFit` in document.documentElement.style)) {
      element.dataset.objectFit = style.objectFit ?? `cover`
      element.dataset.objectPosition = `${style.objectPosition ?? `50% 50%`}`
      applyPolyfill(element as HTMLImageElement)
    }

    return (): void => {
      if (cleanup) {
        cleanup()
      }

      unobserve()
    }
  }

  return startLoading(
    element,
    cacheKey,
    imageCache,
    onStartLoad,
    onLoad,
    onError
  )
}

export function renderImageToString({
  image,
  loading = `lazy`,
  isLoading,
  isLoaded,
  imgClassName,
  imgStyle = {},
  objectPosition,
  backgroundColor,
  objectFit = `cover`,
  ...props
}: LazyHydrateProps): string {
  const {
    width,
    height,
    layout,
    images,
    placeholder,
    backgroundColor: wrapperBackgroundColor,
  } = image

  imgStyle = {
    objectFit,
    objectPosition,
    backgroundColor,
    ...imgStyle,
  }

  return renderToStaticMarkup(
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
        {...(props as Omit<
          MainImageProps,
          "images" | "fallback" | "onLoad" | "onError"
        >)}
        width={width}
        height={height}
        className={imgClassName}
        {...getMainProps(isLoading, isLoaded, images, loading, imgStyle)}
      />
    </LayoutWrapper>
  )
}
