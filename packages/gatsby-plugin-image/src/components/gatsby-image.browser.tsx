import React, {
  ElementType,
  useEffect,
  useRef,
  FunctionComponent,
  ImgHTMLAttributes,
  useState,
} from "react"
import {
  getWrapperProps,
  hasNativeLazyLoadSupport,
  storeImageloaded,
} from "./hooks"
import { LayoutWrapperProps } from "./layout-wrapper"
import { PlaceholderProps } from "./placeholder"
import { MainImageProps } from "./main-image"

export type GatsbyImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "placeholder"
> & {
  alt: string
  as?: ElementType
  layout: LayoutWrapperProps["layout"]
  className?: string
  height?: number
  images: Pick<MainImageProps, "sources" | "fallback">
  placeholder: Pick<PlaceholderProps, "sources" | "fallback">
  width?: number
  onLoad?: Function
  onError?: Function
  onStartLoad?: Function
}

let showedWarning = false

export const GatsbyImageHydrator: FunctionComponent<GatsbyImageProps> = function GatsbyImageHydrator({
  as: Type = `div`,
  style,
  className,
  layout = `fixed`,
  width,
  height,
  images,
  onStartLoad,
  onLoad: customOnLoad,
  ...props
}) {
  const root = useRef<HTMLElement>()
  const hydrated = useRef(false)
  const unobserveRef = useRef(null)
  const lazyHydrator = useRef(null)
  const ref = useRef()
  const [isLoading, toggleIsLoading] = useState(hasNativeLazyLoadSupport)
  const [isLoaded, toggleIsLoaded] = useState(false)

  if (!global.GATSBY___IMAGE && !showedWarning) {
    showedWarning = true
    console.warn(
      `[gatsby-image] You're missing out on some cool performance features. Please add "gatsby-image" to your gatsby-config.js`
    )
  }

  const { style: wStyle, className: wClass, ...wrapperProps } = getWrapperProps(
    width,
    height,
    layout
  )

  useEffect(() => {
    if (root.current) {
      const hasSSRHtml = root.current.querySelector(`[data-gatsby-image-ssr]`)

      // when SSR and native lazyload is supported we'll do nothing ;)
      if (hasNativeLazyLoadSupport && hasSSRHtml && global.GATSBY___IMAGE) {
        onStartLoad && onStartLoad({ wasCached: false })

        if ((hasSSRHtml as HTMLImageElement).complete) {
          customOnLoad && (customOnLoad as Function)()
          storeImageloaded(JSON.stringify(images))
        }
        hasSSRHtml.addEventListener(`load`, function onLoad(e) {
          hasSSRHtml.removeEventListener(`load`, onLoad)

          customOnLoad && (customOnLoad as Function)()
          storeImageloaded(JSON.stringify(images))
        })
        return
      }

      // Fallback to custom lazy loading (intersection observer)
      import(`./intersection-observer`).then(
        ({ createIntersectionObserver }) => {
          const intersectionObserver = createIntersectionObserver(() => {
            if (root.current) {
              onStartLoad && onStartLoad({ wasCached: false })
              toggleIsLoading(true)
            }
          })

          if (root.current) {
            unobserveRef.current = intersectionObserver(root)
          }
        }
      )
    }

    return () => {
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
      if (hasNativeLazyLoadSupport && hasSSRHtml && !hydrated.current) {
        return
      }

      import(`./lazy-hydrate`).then(({ lazyHydrate }) => {
        lazyHydrator.current = lazyHydrate(
          {
            layout,
            width,
            height,
            images,
            isLoading,
            isLoaded,
            toggleIsLoaded: () => {
              customOnLoad && (customOnLoad as Function)()
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
