import React from "react"
import PropTypes from "prop-types"

// Handle legacy names for image queries.
const convertProps = props => {
  let convertedProps = { ...props }
  if (convertedProps.resolutions) {
    convertedProps.fixed = convertedProps.resolutions
    delete convertedProps.resolutions
  }
  if (convertedProps.sizes) {
    convertedProps.fluid = convertedProps.sizes
    delete convertedProps.sizes
  }

  return convertedProps
}

// Find the source of an image to use as a key in the image cache.
// Use `fixed` or `fluid` if specified, or the first image in
// either `fixedImages` or `fluidImages`
const getImageSrc = props =>
  props.fluid
    ? props.fluid.src
    : props.fixed
    ? props.fixed.src
    : props.fluidImages
    ? props.fluidImages[0].src
    : props.fixedImages[0].src

// Cache if we've seen an image before so we don't bother with
// lazy-loading & fading in on subsequent mounts.
const imageCache = Object.create({})
const inImageCache = props => {
  const convertedProps = convertProps(props)
  // Find src
  const src = getImageSrc(convertedProps)
  return imageCache[src] || false
}

const activateCacheForImage = props => {
  const convertedProps = convertProps(props)
  // Find src
  const src = getImageSrc(convertedProps)
  imageCache[src] = true
}

let io
const listeners = new WeakMap()

function getIO() {
  if (
    typeof io === `undefined` &&
    typeof window !== `undefined` &&
    window.IntersectionObserver
  ) {
    io = new window.IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (listeners.has(entry.target)) {
            const cb = listeners.get(entry.target)
            // Edge doesn't currently support isIntersecting, so also test for an intersectionRatio > 0
            if (entry.isIntersecting || entry.intersectionRatio > 0) {
              io.unobserve(entry.target)
              listeners.delete(entry.target)
              cb()
            }
          }
        })
      },
      { rootMargin: `200px` }
    )
  }

  return io
}

function generateImageSources(imageVariants) {
  return imageVariants.map(({ src, srcSet, srcSetWebp, media, sizes }) => (
    <React.Fragment key={src}>
      {srcSetWebp && (
        <source
          type="image/webp"
          media={media}
          srcSet={srcSetWebp}
          sizes={sizes}
        />
      )}
      <source media={media} srcSet={srcSet} sizes={sizes} />
    </React.Fragment>
  ))
}

function generateTracedSVGSources(imageVariants) {
  return imageVariants.map(variant => (
    <source
      key={variant.src}
      media={variant.media}
      srcSet={variant.tracedSVG}
    />
  ))
}

function generateBase64Sources(imageVariants) {
  return imageVariants.map(variant => (
    <source key={variant.src} media={variant.media} srcSet={variant.base64} />
  ))
}

function generateNoscriptSource({ srcSet, srcSetWebp, media, sizes }, isWebp) {
  const src = isWebp ? srcSetWebp : srcSet
  const mediaAttr = media ? `media="${media}" ` : ``
  const typeAttr = isWebp ? `type='image/webp' ` : ``
  const sizesAttr = sizes ? `sizes="${sizes}" ` : ``

  return `<source ${typeAttr}${mediaAttr}srcset="${src}" ${sizesAttr}/>`
}

function generateNoscriptSources(imageVariants) {
  return imageVariants.map(
    variant =>
      (variant.srcSetWebp ? generateNoscriptSource(variant, true) : ``) +
      generateNoscriptSource(variant)
  )
}

const listenToIntersections = (el, cb) => {
  const observer = getIO()

  if (observer) {
    observer.observe(el)
    listeners.set(el, cb)
  }

  return () => {
    observer.unobserve(el)
    listeners.delete(el)
  }
}

const noscriptImg = props => {
  // Check if prop exists before adding each attribute to the string output below to prevent
  // HTML validation issues caused by empty values like width="" and height=""
  const src = props.src ? `src="${props.src}" ` : `src="" ` // required attribute
  const sizes = props.sizes ? `sizes="${props.sizes}" ` : ``
  const srcSet = props.srcSet ? `srcset="${props.srcSet}" ` : ``
  const title = props.title ? `title="${props.title}" ` : ``
  const alt = props.alt ? `alt="${props.alt}" ` : `alt="" ` // required attribute
  const width = props.width ? `width="${props.width}" ` : ``
  const height = props.height ? `height="${props.height}" ` : ``
  const crossOrigin = props.crossOrigin
    ? `crossorigin="${props.crossOrigin}" `
    : ``

  let initialSources = ``
  if (props.srcSetWebp) {
    initialSources += generateNoscriptSource(props, true)
  }
  if (props.media) {
    initialSources += generateNoscriptSource(props)
  }

  const variantSources =
    props.imageVariants.length > 0
      ? generateNoscriptSources(props.imageVariants)
      : ``

  return `<picture>${initialSources}${variantSources}<img ${width}${height}${sizes}${srcSet}${src}${alt}${title}${crossOrigin}style="position:absolute;top:0;left:0;opacity:1;width:100%;height:100%;object-fit:cover;object-position:center"/></picture>`
}

const Img = React.forwardRef((props, ref) => {
  const { sizes, srcSet, src, style, onLoad, onError, ...otherProps } = props

  return (
    <img
      sizes={sizes}
      srcSet={srcSet}
      src={src}
      {...otherProps}
      onLoad={onLoad}
      onError={onError}
      ref={ref}
      style={{
        position: `absolute`,
        top: 0,
        left: 0,
        width: `100%`,
        height: `100%`,
        objectFit: `cover`,
        objectPosition: `center`,
        ...style,
      }}
    />
  )
})

Img.propTypes = {
  style: PropTypes.object,
  onError: PropTypes.func,
  onLoad: PropTypes.func,
}

class Image extends React.Component {
  constructor(props) {
    super(props)

    // default settings for browser without Intersection Observer available
    let isVisible = true
    let imgLoaded = false
    let imgCached = false
    let IOSupported = false
    let fadeIn = props.fadeIn

    // If this image has already been loaded before then we can assume it's
    // already in the browser cache so it's cheap to just show directly.
    const seenBefore = inImageCache(props)

    // browser with Intersection Observer available
    if (
      !seenBefore &&
      typeof window !== `undefined` &&
      window.IntersectionObserver
    ) {
      isVisible = false
      IOSupported = true
    }

    // Never render image during SSR
    if (typeof window === `undefined`) {
      isVisible = false
    }

    // Force render for critical images
    if (props.critical) {
      isVisible = true
      IOSupported = false
    }

    const hasNoScript = !(props.critical && !props.fadeIn)

    this.state = {
      isVisible,
      imgLoaded,
      imgCached,
      IOSupported,
      fadeIn,
      hasNoScript,
      seenBefore,
    }

    this.imageRef = React.createRef()
    this.handleImageLoaded = this.handleImageLoaded.bind(this)
    this.handleRef = this.handleRef.bind(this)
  }

  componentDidMount() {
    if (this.state.isVisible && typeof this.props.onStartLoad === `function`) {
      this.props.onStartLoad({ wasCached: inImageCache(this.props) })
    }
    if (this.props.critical) {
      const img = this.imageRef.current
      if (img && img.complete) {
        this.handleImageLoaded()
      }
    }
  }

  componentWillUnmount() {
    if (this.cleanUpListeners) {
      this.cleanUpListeners()
    }
  }

  handleRef(ref) {
    if (this.state.IOSupported && ref) {
      this.cleanUpListeners = listenToIntersections(ref, () => {
        const imageInCache = inImageCache(this.props)
        if (
          !this.state.isVisible &&
          typeof this.props.onStartLoad === `function`
        ) {
          this.props.onStartLoad({ wasCached: imageInCache })
        }

        // imgCached and imgLoaded must update after isVisible,
        // Once isVisible is true, imageRef becomes accessible, which imgCached needs access to.
        // imgLoaded and imgCached are in a 2nd setState call to be changed together,
        // avoiding initiating unnecessary animation frames from style changes.
        this.setState({ isVisible: true }, () =>
          this.setState({
            imgLoaded: imageInCache,
            imgCached: !!this.imageRef.current.currentSrc,
          })
        )
      })
    }
  }

  handleImageLoaded() {
    activateCacheForImage(this.props)

    this.setState({ imgLoaded: true })
    if (this.state.seenBefore) {
      this.setState({ fadeIn: false })
    }

    if (this.props.onLoad) {
      this.props.onLoad()
    }
  }

  render() {
    const {
      title,
      alt,
      className,
      style = {},
      imgStyle = {},
      placeholderStyle = {},
      placeholderClassName,
      fluid,
      fixed,
      fluidImages,
      fixedImages,
      backgroundColor,
      Tag,
      itemProp,
    } = convertProps(this.props)

    const shouldReveal = this.state.imgLoaded || this.state.fadeIn === false
    const shouldFadeIn = this.state.fadeIn === true && !this.state.imgCached
    const durationFadeIn = `0.5s`

    const imageStyle = {
      opacity: shouldReveal ? 1 : 0,
      transition: shouldFadeIn ? `opacity ${durationFadeIn}` : `none`,
      ...imgStyle,
    }

    const bgColor =
      typeof backgroundColor === `boolean` ? `lightgray` : backgroundColor

    const delayHideStyle = {
      transitionDelay: durationFadeIn,
    }

    const imagePlaceholderStyle = {
      opacity: this.state.imgLoaded ? 0 : 1,
      ...(shouldFadeIn && delayHideStyle),
      ...imgStyle,
      ...placeholderStyle,
    }

    const placeholderImageProps = {
      title,
      alt: !this.state.isVisible ? alt : ``,
      style: imagePlaceholderStyle,
      className: placeholderClassName,
    }

    if (fluid || fluidImages) {
      // First image data is supplied to `image`, if an array the rest will go to `variants`
      const [image, ...imageVariants] = fluidImages ? fluidImages : [fluid]

      return (
        <Tag
          className={`${className ? className : ``} gatsby-image-wrapper`}
          style={{
            position: `relative`,
            overflow: `hidden`,
            ...style,
          }}
          ref={this.handleRef}
          key={`fluid-${JSON.stringify(image.srcSet)}`}
        >
          {/* Preserve the aspect ratio. */}
          <Tag
            style={{
              width: `100%`,
              paddingBottom: `${100 / image.aspectRatio}%`,
            }}
          />

          {/* Show a solid background color. */}
          {bgColor && (
            <Tag
              title={title}
              style={{
                backgroundColor: bgColor,
                position: `absolute`,
                top: 0,
                bottom: 0,
                opacity: !this.state.imgLoaded ? 1 : 0,
                right: 0,
                left: 0,
                ...(shouldFadeIn && delayHideStyle),
              }}
            />
          )}

          {/* Show the blurry base64 image. */}
          {image.base64 && (
            <picture>
              <source media={image.media} srcSet={image.base64} />
              {imageVariants && generateBase64Sources(imageVariants)}
              <Img src={image.base64} {...placeholderImageProps} />
            </picture>
          )}

          {/* Show the traced SVG image. */}
          {image.tracedSVG && (
            <picture>
              <source media={image.media} srcSet={image.tracedSVG} />
              {imageVariants && generateTracedSVGSources(imageVariants)}
              <Img src={image.tracedSVG} {...placeholderImageProps} />
            </picture>
          )}

          {/* Once the image is visible (or the browser doesn't support IntersectionObserver), start downloading the image */}
          {this.state.isVisible && (
            <picture>
              {image.srcSetWebp && (
                <source
                  type={`image/webp`}
                  media={image.media}
                  srcSet={image.srcSetWebp}
                  sizes={image.sizes}
                />
              )}
              <source
                media={image.media}
                srcSet={image.srcSet}
                sizes={image.sizes}
              />
              {imageVariants && generateImageSources(imageVariants)}
              <Img
                alt={alt}
                title={title}
                sizes={image.sizes}
                src={image.src}
                crossOrigin={this.props.crossOrigin}
                srcSet={image.srcSet}
                style={imageStyle}
                ref={this.imageRef}
                onLoad={this.handleImageLoaded}
                onError={this.props.onError}
                itemProp={itemProp}
              />
            </picture>
          )}

          {/* Show the original image during server-side rendering if JavaScript is disabled */}
          {this.state.hasNoScript && (
            <noscript
              dangerouslySetInnerHTML={{
                __html: noscriptImg({ alt, title, ...image, imageVariants }),
              }}
            />
          )}
        </Tag>
      )
    }

    if (fixed || fixedImages) {
      const [image, ...imageVariants] = fixedImages ? fixedImages : [fixed]
      const divStyle = {
        position: `relative`,
        overflow: `hidden`,
        display: `inline-block`,
        width: image.width,
        height: image.height,
        ...style,
      }

      if (style.display === `inherit`) {
        delete divStyle.display
      }

      return (
        <Tag
          className={`${className ? className : ``} gatsby-image-wrapper`}
          style={divStyle}
          ref={this.handleRef}
          key={`fixed-${JSON.stringify(image.srcSet)}`}
        >
          {/* Show a solid background color. */}
          {bgColor && (
            <Tag
              title={title}
              style={{
                backgroundColor: bgColor,
                width: image.width,
                opacity: !this.state.imgLoaded ? 1 : 0,
                height: image.height,
                ...(shouldFadeIn && delayHideStyle),
              }}
            />
          )}

          {/* Show the blurry base64 image. */}
          {image.base64 && (
            <picture>
              <source media={image.media} srcSet={image.base64} />
              {imageVariants && generateBase64Sources(imageVariants)}
              <Img src={image.base64} {...placeholderImageProps} />
            </picture>
          )}

          {/* Show the traced SVG image. */}
          {image.tracedSVG && (
            <picture>
              <source media={image.media} srcSet={image.tracedSVG} />
              {imageVariants && generateTracedSVGSources(imageVariants)}
              <Img src={image.tracedSVG} {...placeholderImageProps} />
            </picture>
          )}

          {/* Once the image is visible, start downloading the image */}
          {this.state.isVisible && (
            <picture>
              {image.srcSetWebp && (
                <source
                  type={`image/webp`}
                  media={image.media}
                  srcSet={image.srcSetWebp}
                  sizes={image.sizes}
                />
              )}
              <source
                media={image.media}
                srcSet={image.srcSet}
                sizes={image.sizes}
              />
              {imageVariants && generateImageSources(imageVariants)}

              <Img
                alt={alt}
                title={title}
                width={image.width}
                height={image.height}
                sizes={image.sizes}
                src={image.src}
                crossOrigin={this.props.crossOrigin}
                srcSet={image.srcSet}
                style={imageStyle}
                ref={this.imageRef}
                onLoad={this.handleImageLoaded}
                onError={this.props.onError}
                itemProp={itemProp}
              />
            </picture>
          )}

          {/* Show the original image during server-side rendering if JavaScript is disabled */}
          {this.state.hasNoScript && (
            <noscript
              dangerouslySetInnerHTML={{
                __html: noscriptImg({
                  alt,
                  title,
                  ...image,
                  imageVariants,
                }),
              }}
            />
          )}
        </Tag>
      )
    }

    return null
  }
}

Image.defaultProps = {
  critical: false,
  fadeIn: true,
  alt: ``,
  Tag: `div`,
}

const fixedObject = PropTypes.shape({
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  src: PropTypes.string.isRequired,
  srcSet: PropTypes.string.isRequired,
  base64: PropTypes.string,
  tracedSVG: PropTypes.string,
  srcWebp: PropTypes.string,
  srcSetWebp: PropTypes.string,
  media: PropTypes.string,
})

const fluidObject = PropTypes.shape({
  aspectRatio: PropTypes.number.isRequired,
  src: PropTypes.string.isRequired,
  srcSet: PropTypes.string.isRequired,
  sizes: PropTypes.string.isRequired,
  base64: PropTypes.string,
  tracedSVG: PropTypes.string,
  srcWebp: PropTypes.string,
  srcSetWebp: PropTypes.string,
  media: PropTypes.string,
})

Image.propTypes = {
  resolutions: fixedObject,
  sizes: fluidObject,
  fixed: fixedObject,
  fluid: fluidObject,
  fixedImages: PropTypes.arrayOf(fixedObject),
  fluidImages: PropTypes.arrayOf(fluidObject),
  fadeIn: PropTypes.bool,
  title: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), // Support Glamor's css prop.
  critical: PropTypes.bool,
  crossOrigin: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  style: PropTypes.object,
  imgStyle: PropTypes.object,
  placeholderStyle: PropTypes.object,
  placeholderClassName: PropTypes.string,
  backgroundColor: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  onStartLoad: PropTypes.func,
  Tag: PropTypes.string,
  itemProp: PropTypes.string,
}

export default Image
