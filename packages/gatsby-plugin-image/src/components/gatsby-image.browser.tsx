/* eslint-disable no-unused-expressions */
import React, {
  ElementType,
  useEffect,
  useRef,
  FunctionComponent,
  ImgHTMLAttributes,
  useState,
  RefObject,
  CSSProperties,
} from "react"
import {
  getWrapperProps,
  hasNativeLazyLoadSupport,
  storeImageloaded,
} from "./hooks"
import { PlaceholderProps } from "./placeholder"
import { MainImageProps } from "./main-image"
import { Layout } from "../image-utils"

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface GatsbyImageProps
  extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    "placeholder" | "onLoad" | "src" | "srcSet" | "width" | "height"
  > {
  alt: string
  as?: ElementType
  className?: string
  imgClassName?: string
  image: IGatsbyImageData
  imgStyle?: CSSProperties
  backgroundColor?: string
  objectFit?: CSSProperties["objectFit"]
  objectPosition?: CSSProperties["objectPosition"]
  onLoad?: () => void
  onError?: () => void
  onStartLoad?: Function
}

export interface IGatsbyImageData {
  layout: Layout
  height?: number
  backgroundColor?: string
  sizes?: string
  images: Pick<MainImageProps, "sources" | "fallback">
  placeholder?: Pick<PlaceholderProps, "sources" | "fallback">
  width?: number
  maxHeight?: number
  maxWidth?: number
}

let hasShownWarning = false

export const GatsbyImageHydrator: FunctionComponent<GatsbyImageProps> = function GatsbyImageHydrator({
  as: Type = `div`,
  style,
  className,
  onStartLoad,
  image,
  onLoad: customOnLoad,
  backgroundColor,
  ...props
}) {
  if (!image) {
    if (process.env.NODE_ENV === `development`) {
      console.warn(`[gatsby-plugin-image] Missing image prop`)
    }
    return null
  }
  const { width, height, layout, images } = image

  const root = useRef<HTMLElement>()
  const hydrated = useRef(false)
  const unobserveRef = useRef<
    ((element: RefObject<HTMLElement | undefined>) => void) | null
  >(null)
  const lazyHydrator = useRef<(() => void) | null>(null)
  const ref = useRef<HTMLImageElement | undefined>()
  const [isLoading, toggleIsLoading] = useState(hasNativeLazyLoadSupport())
  const [isLoaded, toggleIsLoaded] = useState(false)

  if (!global.GATSBY___IMAGE && !hasShownWarning) {
    hasShownWarning = true
    console.warn(
      `[gatsby-plugin-image] You're missing out on some cool performance features. Please add "gatsby-plugin-image" to your gatsby-config.js`
    )
  }

  const { style: wStyle, className: wClass, ...wrapperProps } = getWrapperProps(
    width,
    height,
    layout
  )

  useEffect((): (() => void) | undefined => {
    if (root.current) {
      const hasSSRHtml = root.current.querySelector(
        `[data-gatsby-image-ssr]`
      ) as HTMLImageElement

      // when SSR and native lazyload is supported we'll do nothing ;)
      if (hasNativeLazyLoadSupport() && hasSSRHtml && global.GATSBY___IMAGE) {
        onStartLoad?.({ wasCached: false })

        if (hasSSRHtml.complete) {
          customOnLoad?.()
          storeImageloaded(JSON.stringify(images))
        }
        hasSSRHtml.addEventListener(`load`, function onLoad() {
          hasSSRHtml.removeEventListener(`load`, onLoad)

          customOnLoad?.()
          storeImageloaded(JSON.stringify(images))
        })
        return undefined
      }

      // Fallback to custom lazy loading (intersection observer)
      import(`./intersection-observer`).then(
        ({ createIntersectionObserver }) => {
          const intersectionObserver = createIntersectionObserver(() => {
            if (root.current) {
              onStartLoad?.({ wasCached: false })
              toggleIsLoading(true)
            }
          })

          if (root.current) {
            unobserveRef.current = intersectionObserver(root)
          }
        }
      )
    }

    return (): void => {
      if (unobserveRef.current) {
        unobserveRef.current(root)

        // on unmount, make sure we cleanup
        if (hydrated.current && lazyHydrator.current) {
          lazyHydrator.current()
        }
      }
    }
  }, [])

  useEffect(() => {
    if (root.current) {
      const hasSSRHtml = root.current.querySelector(`[data-gatsby-image-ssr]`)
      // On first server hydration do nothing
      if (hasNativeLazyLoadSupport() && hasSSRHtml && !hydrated.current) {
        hydrated.current = true
        return
      }

      // When no ssrHtml is found (develop) we should force render instead of hydrate
      if (!hasSSRHtml) {
        hydrated.current = true
      }

      import(`./lazy-hydrate`).then(({ lazyHydrate }) => {
        lazyHydrator.current = lazyHydrate(
          {
            image,
            isLoading,
            isLoaded,
            toggleIsLoaded: () => {
              customOnLoad?.()
              toggleIsLoaded(true)
            },
            ref,
            ...props,
          },
          root,
          hydrated
        )
      })
    }
  }, [
    width,
    height,
    layout,
    images,
    isLoading,
    isLoaded,
    toggleIsLoaded,
    ref,
    props,
  ])

  return (
    <Type
      {...wrapperProps}
      style={{
        ...wStyle,
        ...style,
        backgroundColor,
      }}
      className={`${wClass}${className ? ` ${className}` : ``}`}
      ref={root}
      dangerouslySetInnerHTML={{ __html: `` }}
      suppressHydrationWarning
    />
  )
}

export const GatsbyImage: FunctionComponent<GatsbyImageProps> = function GatsbyImage(
  props
) {
  return <GatsbyImageHydrator {...props} />
}
GatsbyImage.displayName = `GatsbyImage`
