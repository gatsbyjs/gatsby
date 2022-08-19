import {
  createElement,
  memo,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react"
import {
  getWrapperProps,
  gatsbyImageIsInstalled,
  hasNativeLazyLoadSupport,
} from "./hooks"
import { getSizer } from "./layout-wrapper"
import { propTypes } from "./gatsby-image.server"
import type {
  FC,
  ElementType,
  FunctionComponent,
  ImgHTMLAttributes,
  CSSProperties,
  ReactEventHandler,
} from "react"
import type { renderImageToString } from "./lazy-hydrate"
import type { PlaceholderProps } from "./placeholder"
import type { MainImageProps } from "./main-image"
import type { Layout } from "../image-utils"

const imageCache = new Set<string>()
let renderImageToStringPromise
let renderImage: typeof renderImageToString | undefined

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface GatsbyImageProps
  extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    "placeholder" | "onLoad" | "src" | "srcSet" | "width" | "height"
  > {
  alt: string
  as?: ElementType
  className?: string
  class?: string
  imgClassName?: string
  image: IGatsbyImageData
  imgStyle?: CSSProperties
  backgroundColor?: string
  objectFit?: CSSProperties["objectFit"]
  objectPosition?: CSSProperties["objectPosition"]
  onLoad?: (props: { wasCached: boolean }) => void
  onError?: ReactEventHandler<HTMLImageElement>
  onStartLoad?: (props: { wasCached: boolean }) => void
}

export interface IGatsbyImageData {
  layout: Layout
  width: number
  height: number
  backgroundColor?: string
  images: Pick<MainImageProps, "sources" | "fallback">
  placeholder?: Pick<PlaceholderProps, "sources" | "fallback">
}

const GatsbyImageHydrator: FC<GatsbyImageProps> = function GatsbyImageHydrator({
  as = `div`,
  image,
  style,
  backgroundColor,
  className,
  class: preactClass,
  onStartLoad,
  onLoad,
  onError,
  ...props
}) {
  const { width, height, layout } = image
  const {
    style: wStyle,
    className: wClass,
    ...wrapperProps
  } = getWrapperProps(width, height, layout)
  const root = useRef<HTMLElement>()
  const cacheKey = useMemo(() => JSON.stringify(image.images), [image.images])

  // Preact uses class instead of className so we need to check for both
  if (preactClass) {
    className = preactClass
  }

  const sizer = getSizer(layout, width, height)

  useEffect(() => {
    if (!renderImageToStringPromise) {
      renderImageToStringPromise = import(`./lazy-hydrate`).then(
        ({ renderImageToString, swapPlaceholderImage }) => {
          renderImage = renderImageToString

          return {
            renderImageToString,
            swapPlaceholderImage,
          }
        }
      )
    }

    // The plugin image component is a bit special where if it's server-side rendered, we add extra script tags to support lazy-loading without
    // In this case we stop hydration but fire the correct events.
    const ssrImage = root.current.querySelector(
      `[data-gatsby-image-ssr]`
    ) as HTMLImageElement
    if (ssrImage && hasNativeLazyLoadSupport()) {
      if (ssrImage.complete) {
        // Trigger onStartload and onLoad events
        onStartLoad?.({
          wasCached: true,
        })
        onLoad?.({
          wasCached: true,
        })

        // remove ssr key for state updates but add delay to not fight with native code snippt of gatsby-ssr
        setTimeout(() => {
          ssrImage.removeAttribute(`data-gatsby-image-ssr`)
        }, 0)
      } else {
        onStartLoad?.({
          wasCached: true,
        })

        ssrImage.addEventListener(`load`, function onLoadListener() {
          ssrImage.removeEventListener(`load`, onLoadListener)

          onLoad?.({
            wasCached: true,
          })
          // remove ssr key for state updates but add delay to not fight with native code snippt of gatsby-ssr
          setTimeout(() => {
            ssrImage.removeAttribute(`data-gatsby-image-ssr`)
          }, 0)
        })
      }

      imageCache.add(cacheKey)

      return
    }

    if (renderImage && imageCache.has(cacheKey)) {
      return
    }

    let animationFrame
    let cleanupCallback
    renderImageToStringPromise.then(
      ({ renderImageToString, swapPlaceholderImage }) => {
        if (!root.current) {
          return
        }

        root.current.innerHTML = renderImageToString({
          isLoading: true,
          isLoaded: imageCache.has(cacheKey),
          image,
          ...props,
        })

        if (!imageCache.has(cacheKey)) {
          animationFrame = requestAnimationFrame(() => {
            if (root.current) {
              cleanupCallback = swapPlaceholderImage(
                root.current,
                cacheKey,
                imageCache,
                style,
                onStartLoad,
                onLoad,
                onError
              )
            }
          })
        }
      }
    )

    // eslint-disable-next-line consistent-return
    return (): void => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      if (cleanupCallback) {
        cleanupCallback()
      }
    }
  }, [image])

  // useLayoutEffect is ran before React commits to the DOM. This allows us to make sure our HTML is using our cached image version
  useLayoutEffect(() => {
    if (imageCache.has(cacheKey) && renderImage) {
      root.current.innerHTML = renderImage({
        isLoading: imageCache.has(cacheKey),
        isLoaded: imageCache.has(cacheKey),
        image,
        ...props,
      })

      // Trigger onStartload and onLoad events
      onStartLoad?.({
        wasCached: true,
      })
      onLoad?.({
        wasCached: true,
      })
    }
  }, [image])

  // By keeping all props equal React will keep the component in the DOM
  return createElement(as, {
    ...wrapperProps,
    style: {
      ...wStyle,
      ...style,
      backgroundColor,
    },
    className: `${wClass}${className ? ` ${className}` : ``}`,
    ref: root,
    dangerouslySetInnerHTML: {
      __html: sizer,
    },
    suppressHydrationWarning: true,
  })
}

export const GatsbyImage: FunctionComponent<GatsbyImageProps> = memo(
  function GatsbyImage(props) {
    if (!props.image) {
      if (process.env.NODE_ENV === `development`) {
        console.warn(`[gatsby-plugin-image] Missing image prop`)
      }

      return null
    }

    if (!gatsbyImageIsInstalled() && process.env.NODE_ENV === `development`) {
      console.warn(
        `[gatsby-plugin-image] You're missing out on some cool performance features. Please add "gatsby-plugin-image" to your gatsby-config.js`
      )
    }

    return createElement(GatsbyImageHydrator, props)
  }
)

GatsbyImage.propTypes = propTypes
GatsbyImage.displayName = `GatsbyImage`
