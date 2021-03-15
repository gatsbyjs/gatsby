/* eslint-disable no-unused-expressions */
import React, {
  Component,
  ElementType,
  createRef,
  MutableRefObject,
  FunctionComponent,
  ImgHTMLAttributes,
  RefObject,
  CSSProperties,
} from "react"
import {
  getWrapperProps,
  hasNativeLazyLoadSupport,
  storeImageloaded,
  hasImageLoaded,
} from "./hooks"
import { PlaceholderProps } from "./placeholder"
import { MainImageProps } from "./main-image"
import { Layout } from "../image-utils"
import { getSizer } from "./layout-wrapper"
import { propTypes } from "./gatsby-image.server"
import { Unobserver } from "./intersection-observer"
import { render } from "react-dom"

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
  onLoad?: () => void
  onError?: () => void
  onStartLoad?: (props: { wasCached?: boolean }) => void
}

export interface IGatsbyImageData {
  layout: Layout
  width: number
  height: number
  backgroundColor?: string
  images: Pick<MainImageProps, "sources" | "fallback">
  placeholder?: Pick<PlaceholderProps, "sources" | "fallback">
}

class GatsbyImageHydrator extends Component<
  GatsbyImageProps,
  { isLoading: boolean; isLoaded: boolean }
> {
  root: RefObject<HTMLImageElement | undefined> = createRef<
    HTMLImageElement | undefined
  >()
  hydrated: MutableRefObject<boolean> = { current: false }
  lazyHydrator: () => void | null = null
  ref = createRef<HTMLImageElement>()
  unobserveRef: (element: RefObject<HTMLElement | undefined>) => Unobserver

  constructor(props) {
    super(props)

    this.state = {
      isLoading: hasNativeLazyLoadSupport(),
      isLoaded: false,
    }
  }

  _lazyHydrate(props, state): Promise<void> {
    const hasSSRHtml = this.root.current.querySelector(
      `[data-gatsby-image-ssr]`
    )
    // On first server hydration do nothing
    if (hasNativeLazyLoadSupport() && hasSSRHtml && !this.hydrated.current) {
      this.hydrated.current = true
      return Promise.resolve()
    }

    return import(`./lazy-hydrate`).then(({ lazyHydrate }) => {
      this.lazyHydrator = lazyHydrate(
        {
          image: props.image.images,
          isLoading: state.isLoading,
          isLoaded: state.isLoaded,
          toggleIsLoaded: () => {
            props.onLoad?.()

            this.setState({
              isLoaded: true,
            })
          },
          ref: this.ref,
          ...props,
        },
        this.root,
        this.hydrated
      )
    })
  }

  /**
   * Choose if setupIntersectionObserver should use the image cache or not.
   */
  _setupIntersectionObserver(useCache = true): void {
    import(`./intersection-observer`).then(({ createIntersectionObserver }) => {
      const intersectionObserver = createIntersectionObserver(() => {
        if (this.root.current) {
          const cacheKey = JSON.stringify(this.props.image.images)
          this.props.onStartLoad?.({
            wasCached: useCache && hasImageLoaded(cacheKey),
          })
          this.setState({
            isLoading: true,
            isLoaded: useCache && hasImageLoaded(cacheKey),
          })
        }
      })

      if (this.root.current) {
        // @ts-ignore - hello
        this.unobserveRef = intersectionObserver(this.root)
      }
    })
  }

  shouldComponentUpdate(nextProps, nextState): boolean {
    let hasChanged = false

    // this check mostly means people do not have the correct ref checks in place, we want to reset some state to suppport loading effects
    if (this.props.image.images !== nextProps.image.images) {
      // reset state, we'll rely on intersection observer to reload
      if (this.unobserveRef) {
        // unregister intersectionObserver
        this.unobserveRef(this.root)

        // // on unmount, make sure we cleanup
        if (this.hydrated.current && this.lazyHydrator) {
          render(null, this.root.current)
        }
      }

      this.setState(
        {
          isLoading: false,
          isLoaded: false,
        },
        () => {
          this._setupIntersectionObserver(false)
        }
      )

      hasChanged = true
    }

    if (this.root.current && !hasChanged) {
      console.log(nextState)
      this._lazyHydrate(nextProps, nextState)
    }

    return false
  }

  componentDidMount(): void {
    if (this.root.current) {
      const hasSSRHtml = this.root.current.querySelector(
        `[data-gatsby-image-ssr]`
      ) as HTMLImageElement
      const cacheKey = JSON.stringify(this.props.image.images)

      // when SSR and native lazyload is supported we'll do nothing ;)
      if (hasNativeLazyLoadSupport() && hasSSRHtml && global.GATSBY___IMAGE) {
        this.props.onStartLoad?.({ wasCached: false })

        // When the image is already loaded before we have hydrated, we trigger onLoad and cache the item
        if (hasSSRHtml.complete) {
          this.props.onLoad?.()
          storeImageloaded(cacheKey)
        } else {
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const _this = this
          // add an onLoad to the image
          hasSSRHtml.addEventListener(`load`, function onLoad() {
            hasSSRHtml.removeEventListener(`load`, onLoad)

            _this.props.onLoad?.()
            storeImageloaded(cacheKey)
          })
        }

        return
      }

      // Fallback to custom lazy loading (intersection observer)
      this._setupIntersectionObserver(true)
    }
  }

  componentWillUnmount(): void {
    // Cleanup when onmount happens
    if (this.unobserveRef) {
      // unregister intersectionObserver
      this.unobserveRef(this.root)

      // on unmount, make sure we cleanup
      if (this.hydrated.current && this.lazyHydrator) {
        this.lazyHydrator()
      }
    }

    return
  }

  render(): JSX.Element {
    const Type = this.props.as || `div`
    const { width, height, layout } = this.props.image
    const {
      style: wStyle,
      className: wClass,
      ...wrapperProps
    } = getWrapperProps(width, height, layout)

    let className = this.props.className
    // preact class
    if (this.props.class) {
      className = this.props.class
    }

    const sizer = getSizer(layout, width, height)

    return (
      <Type
        {...wrapperProps}
        style={{
          ...wStyle,
          ...this.props.style,
          backgroundColor: this.props.backgroundColor,
        }}
        className={`${wClass}${className ? ` ${className}` : ``}`}
        ref={this.root}
        dangerouslySetInnerHTML={{
          __html: sizer,
        }}
        suppressHydrationWarning
      />
    )
  }
}

export const GatsbyImage: FunctionComponent<GatsbyImageProps> = function GatsbyImage(
  props
) {
  if (!props.image) {
    if (process.env.NODE_ENV === `development`) {
      console.warn(`[gatsby-plugin-image] Missing image prop`)
    }
    return null
  }

  if (!global.GATSBY___IMAGE) {
    console.warn(
      `[gatsby-plugin-image] You're missing out on some cool performance features. Please add "gatsby-plugin-image" to your gatsby-config.js`
    )
  }
  const { className, class: classSafe, backgroundColor, image } = props
  const { width, height, layout } = image
  const propsKey = JSON.stringify([
    width,
    height,
    layout,
    className,
    classSafe,
    backgroundColor,
  ])
  return <GatsbyImageHydrator key={propsKey} {...props} />
}

GatsbyImage.propTypes = propTypes

GatsbyImage.displayName = `GatsbyImage`
