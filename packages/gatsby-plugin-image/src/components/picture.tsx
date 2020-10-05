import {
  createElement,
  FunctionComponent,
  ImgHTMLAttributes,
  forwardRef,
  LegacyRef,
} from "react"
import * as PropTypes from "prop-types"

interface ResponsiveImageProps {
  sizes?: string
  srcSet: string
}

export type SourceProps = ResponsiveImageProps &
  (
    | {
        media: string
        type?: string
      }
    | {
        media?: string
        type: string
      }
  )

type FallbackProps = { src: string } & Partial<ResponsiveImageProps>

type ImageProps = ImgHTMLAttributes<{}> & {
  src: string
  alt: string
  shouldLoad: boolean
  innerRef: LegacyRef<HTMLImageElement>
}

export type PictureProps = ImgHTMLAttributes<{}> & {
  fallback: FallbackProps
  sources?: Array<SourceProps>
  alt: string
  shouldLoad?: boolean
}

const Image: FunctionComponent<ImageProps> = function Image({
  src,
  srcSet,
  loading,
  alt = ``,
  shouldLoad,
  innerRef,
  ...props
}) {
  return (
    <img
      {...props}
      decoding="async"
      loading={loading}
      src={shouldLoad ? src : null}
      data-src={!shouldLoad ? src : null}
      srcSet={shouldLoad ? srcSet : null}
      data-srcset={!shouldLoad ? srcSet : null}
      alt={alt}
      // @ts-ignore
      ref={innerRef}
    />
  )
}

export const Picture = forwardRef<HTMLImageElement, PictureProps>(
  function Picture(
    { fallback, sources = [], shouldLoad = true, ...props },
    ref
  ) {
    const fallbackImage = (
      <Image {...props} {...fallback} shouldLoad={shouldLoad} innerRef={ref} />
    )

    if (!sources.length) {
      return fallbackImage
    }

    return (
      <picture>
        {sources.map(({ media, srcSet, type }) => (
          <source
            key={`${media}-${type}-${srcSet}`}
            type={type}
            media={media}
            srcSet={srcSet}
          />
        ))}
        {fallbackImage}
      </picture>
    )
  }
)

Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  sizes: PropTypes.string,
  srcSet: PropTypes.string,
  shouldLoad: PropTypes.bool,
}

Picture.displayName = `Picture`
Picture.propTypes = {
  alt: PropTypes.string.isRequired,
  shouldLoad: PropTypes.bool,
  fallback: PropTypes.exact({
    src: PropTypes.string.isRequired,
    srcSet: PropTypes.string,
    sizes: PropTypes.string,
  }),
  sources: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.exact({
        media: PropTypes.string.isRequired,
        type: PropTypes.string,
        sizes: PropTypes.string,
        srcSet: PropTypes.string.isRequired,
      }),
      PropTypes.exact({
        media: PropTypes.string,
        type: PropTypes.string.isRequired,
        sizes: PropTypes.string,
        srcSet: PropTypes.string.isRequired,
      }),
    ])
  ),
}
