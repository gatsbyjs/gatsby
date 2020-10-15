import {
  useState,
  CSSProperties,
  useEffect,
  HTMLAttributes,
  ImgHTMLAttributes,
  ReactEventHandler,
  SetStateAction,
  Dispatch,
} from "react"
import { PlaceholderProps } from "./placeholder"
import { MainImageProps } from "./main-image"
const imageCache = new Set<string>()

// Native lazy-loading support: https://addyosmani.com/blog/lazy-loading/
export const hasNativeLazyLoadSupport =
  typeof HTMLImageElement !== `undefined` &&
  `loading` in HTMLImageElement.prototype

export function storeImageloaded(cacheKey?: string): void {
  if (cacheKey) {
    imageCache.add(cacheKey)
  }
}

export function hasImageLoaded(cacheKey: string): boolean {
  return imageCache.has(cacheKey)
}

export function getWrapperProps(
  width: number,
  height: number,
  layout: "intrinsic" | "responsive" | "fixed"
): Pick<HTMLAttributes<HTMLElement>, "className" | "style"> {
  const wrapperStyle: CSSProperties = {
    position: `relative`,
  }

  if (layout === `fixed`) {
    wrapperStyle.width = width
    wrapperStyle.height = height
  }

  if (layout === `intrinsic`) {
    wrapperStyle.display = `inline-block`
  }

  return {
    className: `gatsby-image-wrapper`,
    style: wrapperStyle,
  }
}

export function getMainProps(
  isLoading: boolean,
  isLoaded: boolean,
  images: any,
  loading?: "eager" | "lazy",
  toggleLoaded?: any,
  cacheKey?: string,
  ref?: any
): MainImageProps {
  const onLoad: ReactEventHandler<HTMLImageElement> = function (e) {
    if (isLoaded) {
      return
    }

    storeImageloaded(cacheKey)

    const target = e.currentTarget
    const img = new Image()
    img.src = target.currentSrc

    if (img.decode) {
      // Decode the image through javascript to support our transition
      img
        .decode()
        .catch(() => {
          // ignore error, we just go forward
        })
        .then(() => {
          toggleLoaded(true)
        })
    } else {
      toggleLoaded(true)
    }
  }

  const result = {
    ...images,
    loading,
    shouldLoad: isLoading,
    "data-main-image": ``,
    style: {
      opacity: isLoaded ? 1 : 0,
    },
    onLoad,
    ref,
  }

  // fallback when it's not configured in gatsby-config.
  if (!global.GATSBY___IMAGE) {
    result.style.height = `100%`
    result.style.left = 0
    result.style.position = `absolute`
    result.style.top = 0
    result.style.transform = `translateZ(0)`
    result.style.transition = `opacity 500ms linear`
    result.style.width = `100%`
    result.style.willChange = `opacity`
  }

  return result
}

export type PlaceholderImageAttrs = ImgHTMLAttributes<HTMLImageElement> &
  Pick<PlaceholderProps, "sources" | "fallback">

export function getPlaceHolderProps(
  placeholder: PlaceholderImageAttrs
): PlaceholderImageAttrs {
  const result: PlaceholderImageAttrs = {
    ...placeholder,
    "aria-hidden": true,
  }

  // fallback when it's not configured in gatsby-config.
  if (!global.GATSBY___IMAGE) {
    result.style = {
      height: `100%`,
      left: 0,
      position: `absolute`,
      top: 0,
      width: `100%`,
    }
  }

  return result
}

export function useImageLoaded(
  cacheKey: string,
  loading: "lazy" | "eager",
  ref: any
): {
  isLoaded: boolean
  isLoading: boolean
  toggleLoaded: Dispatch<SetStateAction<boolean>>
} {
  const [isLoaded, toggleLoaded] = useState(false)
  const [isLoading, toggleIsLoading] = useState(loading === `eager`)

  const rAF =
    typeof window !== `undefined` && `requestAnimationFrame` in window
      ? requestAnimationFrame
      : function (cb: TimerHandler): number {
          return setTimeout(cb, 16)
        }
  const cRAF =
    typeof window !== `undefined` && `cancelAnimationFrame` in window
      ? cancelAnimationFrame
      : clearTimeout

  useEffect(() => {
    let interval: number
    // @see https://stackoverflow.com/questions/44074747/componentdidmount-called-before-ref-callback/50019873#50019873
    function toggleIfRefExists(): void {
      if (ref.current) {
        if (loading === `eager` && ref.current.complete) {
          storeImageloaded(cacheKey)
          toggleLoaded(true)
        } else {
          toggleIsLoading(true)
        }
      } else {
        interval = rAF(toggleIfRefExists)
      }
    }
    toggleIfRefExists()

    return (): void => {
      cRAF(interval)
    }
  }, [])

  return {
    isLoading,
    isLoaded,
    toggleLoaded,
  }
}
