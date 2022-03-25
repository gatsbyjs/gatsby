import {
  createElement,
  memo,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react"
import { getWrapperProps, gatsbyImageIsInstalled } from "./hooks"
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

const GatsbyImageHydrator: FC<GatsbyImageProps> = function GatsbyImageHydrator(
  props
) {
  const { width, height, layout } = props.image
  const {
    style: wStyle,
    className: wClass,
    ...wrapperProps
  } = getWrapperProps(width, height, layout)
  const root = useRef<HTMLElement>()
  const cacheKey = useMemo(
    () => JSON.stringify(props.image.images),
    [props.image.images]
  )

  let className = props.className
  // Preact uses class instead of className so we need to check for both
  if (props.class) {
    className = props.class
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
    if (ssrImage) {
      if (ssrImage.complete) {
        // Trigger onStartload and onLoad events
        props?.onStartLoad?.({
          wasCached: true,
        })
        props?.onLoad?.({
          wasCached: true,
        })
      } else {
        document.addEventListener(`load`, function onLoad() {
          document.removeEventListener(`load`, onLoad)

          props?.onStartLoad?.({
            wasCached: true,
          })
          props?.onLoad?.({
            wasCached: true,
          })
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
        root.current.innerHTML = renderImageToString({
          image: props.image.images,
          isLoading: true,
          isLoaded: imageCache.has(cacheKey),
          ...props,
        })

        if (!imageCache.has(cacheKey)) {
          animationFrame = requestAnimationFrame(() => {
            if (root.current) {
              cleanupCallback = swapPlaceholderImage(
                root.current,
                cacheKey,
                imageCache,
                props.style,
                props.onStartLoad,
                props.onLoad,
                props.onError
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
  }, [props.image.images])

  // We need to run this effect before browser has paint to make sure our html is set so no flickering happens
  //
  useLayoutEffect(() => {
    if (imageCache.has(cacheKey) && renderImage) {
      root.current.innerHTML = renderImage({
        image: props.image.images,
        isLoading: imageCache.has(cacheKey),
        isLoaded: imageCache.has(cacheKey),
        ...props,
      })

      // Trigger onStartload and onLoad events
      props?.onStartLoad?.({
        wasCached: true,
      })
      props?.onLoad?.({
        wasCached: true,
      })
    }
  }, [props.image.images])

  return createElement(props.as || `div`, {
    ...wrapperProps,
    style: {
      ...wStyle,
      ...props.style,
      backgroundColor: props.backgroundColor,
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
