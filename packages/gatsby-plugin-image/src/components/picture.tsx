/* eslint-disable filenames/match-regex */
import React, {
  FunctionComponent,
  ImgHTMLAttributes,
  forwardRef,
  LegacyRef,
} from "react"
import * as PropTypes from "prop-types"

export interface IResponsiveImageProps {
  sizes?: string
  srcSet: string
}

export type SourceProps = IResponsiveImageProps &
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

type FallbackProps = { src: string } & Partial<IResponsiveImageProps>

type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string
  alt: string
  shouldLoad: boolean
  innerRef: LegacyRef<HTMLImageElement>
}

export type PictureProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallback?: FallbackProps
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
      src={shouldLoad ? src : undefined}
      data-src={!shouldLoad ? src : undefined}
      srcSet={shouldLoad ? srcSet : undefined}
      data-srcset={!shouldLoad ? srcSet : undefined}
      alt={alt}
      ref={innerRef}
    />
  )
}

export const Picture = forwardRef<HTMLImageElement, PictureProps>(
  function Picture(
    { fallback, sources = [], shouldLoad = true, ...props },
    ref
  ) {
    const sizes = props.sizes || fallback?.sizes
    const fallbackImage = (
      <Image
        {...props}
        {...fallback}
        sizes={sizes}
        shouldLoad={shouldLoad}
        innerRef={ref}
      />
    )

    if (!sources.length) {
      return fallbackImage
    }

    // Default is true, so only attach the prop if the value is explicitly set to `false`
    const pictureProps = props.draggable === false ? { draggable: false } : {}

    return (
      <picture {...pictureProps}>
        {sources.map(({ media, srcSet, type }) => (
          <source
            key={`${media}-${type}-${srcSet}`}
            type={type}
            media={media}
            srcSet={shouldLoad ? srcSet : undefined}
            data-srcset={!shouldLoad ? srcSet : undefined}
            sizes={sizes}
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
