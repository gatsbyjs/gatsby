import { useState, CSSProperties, useEffect, useRef, RefObject } from "react"
const imageCache = new Set<string>()

// Native lazy-loading support: https://addyosmani.com/blog/lazy-loading/
export const hasNativeLazyLoadSupport =
  typeof HTMLImageElement !== `undefined` &&
  `loading` in HTMLImageElement.prototype

export function storeImageloaded(cacheKey: string): void {
  imageCache.add(cacheKey)
}

export function hasImageLoaded(cacheKey: string): boolean {
  return imageCache.has(cacheKey)
}

export function getWrapperProps(
  width: number,
  height: number,
  layout: "intrinsic" | "responsive" | "fixed"
) {
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
    className: `gatsby-image`,
    style: wrapperStyle,
  }
}

export function getMainProps(
  isLoading: boolean,
  isLoaded: boolean,
  images: any,
  loading: "eager" | "lazy",
  toggleLoaded?: any,
  cacheKey?: string,
  ref?: any
): any {
  const result = {
    ...images,
    loading,
    shouldLoad: isLoading,
    "data-main-image": ``,
    style: {
      opacity: isLoaded ? 1 : 0,
    },
    onLoad: function (e: any) {
      if (isLoaded) {
        return
      }

      storeImageloaded(cacheKey)

      const target = e.target
      const img = new Image()
      img.src = target.currentSrc

      if (img.decode) {
        // Decode the image through javascript to support our transition
        img
          .decode()
          .catch(err => {
            // ignore error, we just go forward
          })
          .then(() => {
            toggleLoaded(true)
          })
      } else {
        toggleLoaded(true)
      }
    },
    ref,
  }

  // @ts-ignore
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

export function getPlaceHolderProps(placeholder: any) {
  const result = {
    ...placeholder,
    "aria-hidden": true,
  }

  // @ts-ignore
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
) {
  const [isLoaded, toggleLoaded] = useState(false)
  const [isLoading, toggleIsLoading] = useState(loading === `eager`)

  const rAF =
    typeof window !== `undefined` && `requestAnimationFrame` in window
      ? requestAnimationFrame
      : function (cb: Function) {
          return setTimeout(cb, 16)
        }
  const cRAF =
    typeof window !== `undefined` && `cancelAnimationFrame` in window
      ? cancelAnimationFrame
      : clearTimeout

  useEffect(() => {
    let interval: any
    // @see https://stackoverflow.com/questions/44074747/componentdidmount-called-before-ref-callback/50019873#50019873
    function toggleIfRefExists() {
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

    return () => {
      cRAF(interval)
    }
  }, [])

  return {
    isLoading,
    isLoaded,
    toggleLoaded,
  }
}

// return () => {
//   if (root.current) {
//     render(null, root.current);
//   }
// };
// }

// export function useGatsbyImage({
//   placeholder,
//   images,
//   width,
//   height,
//   aspectRatio,
//   maxWidth,
//   maxHeight,
//   loading = 'lazy',
// }: any): any {
//   const cacheKey = JSON.stringify(images);
//   const ref = useRef();
//   const { isLoading, isLoaded, toggleLoaded } = useImageLoaded(
//     cacheKey,
//     loading,
//     ref
//   );

//   return {
//     getWrapperProps: () =>
//       getWrapperProps(width, height, layout),
//     getMainImageProps: () =>
//       getMainProps(
//         isLoading || hasNativeLazyLoadSupport,
//         isLoaded,
//         images,
//         loading,
//         aspectRatio,
//         toggleLoaded,
//         cacheKey,
//         ref
//       ),
//     getPlaceholderProps: () => getPlaceHolderProps(placeholder),
//   };
// }
