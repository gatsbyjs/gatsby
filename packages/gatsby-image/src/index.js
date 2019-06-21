import React from "react"
import PropTypes from "prop-types"

const logDeprecationNotice = (prop, replacement) => {
  if (process.env.NODE_ENV === `production`) {
    return
  }

  console.log(
    `
    The "${prop}" prop is now deprecated and will be removed in the next major version
    of "gatsby-image".
    `
  )

  if (replacement) {
    console.log(`Please use ${replacement} instead of "${prop}".`)
  }
}

// Handle legacy props during their deprecation phase
const convertProps = props => {
  let convertedProps = { ...props }
  const { resolutions, sizes, critical } = convertedProps

  if (resolutions) {
    convertedProps.fixed = resolutions
    delete convertedProps.resolutions
  }
  if (sizes) {
    convertedProps.fluid = sizes
    delete convertedProps.sizes
  }

  if (critical) {
    logDeprecationNotice(`critical`, `the native "loading" attribute`)
    convertedProps.loading = `eager`
  }

  return convertedProps
}

// Cache if we've seen an image before so we don't bother with
// lazy-loading & fading in on subsequent mounts.
const imageCache = Object.create({})
const inImageCache = props => {
  const convertedProps = convertProps(props)
  // Find src
  const src = convertedProps.fluid
    ? convertedProps.fluid.src
    : convertedProps.fixed.src

  return imageCache[src] || false
}

const activateCacheForImage = props => {
  const convertedProps = convertProps(props)
  // Find src
  const src = convertedProps.fluid
    ? convertedProps.fluid.src
    : convertedProps.fixed.src

  imageCache[src] = true
}

// Native lazy-loading support: https://addyosmani.com/blog/lazy-loading/
const hasNativeLazyLoadSupport =
  typeof HTMLImageElement !== `undefined` &&
  `loading` in HTMLImageElement.prototype

const isBrowser = typeof window !== `undefined`
const hasIOSupport = isBrowser && window.IntersectionObserver

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
  const srcSetWebp = props.srcSetWebp
    ? `<source type='image/webp' srcset="${props.srcSetWebp}" ${sizes}/>`
    : ``
  const srcSet = props.srcSet ? `srcset="${props.srcSet}" ` : ``
  const title = props.title ? `title="${props.title}" ` : ``
  const alt = props.alt ? `alt="${props.alt}" ` : `alt="" ` // required attribute
  const width = props.width ? `width="${props.width}" ` : ``
  const height = props.height ? `height="${props.height}" ` : ``
  const crossOrigin = props.crossOrigin
    ? `crossorigin="${props.crossOrigin}" `
    : ``
  const loading = props.loading ? `loading="${props.loading}" ` : ``

  return `<picture>${srcSetWebp}<img ${loading}${width}${height}${sizes}${srcSet}${src}${alt}${title}${crossOrigin}style="position:absolute;top:0;left:0;opacity:1;width:100%;height:100%;object-fit:cover;object-position:center"/></picture>`
}

const Img = React.forwardRef((props, ref) => {
  const {
    sizes,
    srcSet,
    src,
    style,
    onLoad,
    onError,
    loading,
    ...otherProps
  } = props

  return (
    <img
      sizes={sizes}
      srcSet={srcSet}
      src={src}
      {...otherProps}
      onLoad={onLoad}
      onError={onError}
      ref={ref}
      loading={loading}
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

    // If this image has already been loaded before then we can assume it's
    // already in the browser cache so it's cheap to just show directly.
    this.seenBefore = isBrowser && inImageCache(props)

    this.addNoScript = !(props.critical && !props.fadeIn)
    this.useIOSupport =
      !hasNativeLazyLoadSupport &&
      hasIOSupport &&
      !props.critical &&
      !this.seenBefore

    const isVisible =
      props.critical ||
      (isBrowser && (hasNativeLazyLoadSupport || !this.useIOSupport))

    this.state = {
      isVisible,
      imgLoaded: false,
      imgCached: false,
      fadeIn: !this.seenBefore && props.fadeIn,
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

  // Specific to IntersectionObserver based lazy-load support
  handleRef(ref) {
    if (this.useIOSupport && ref) {
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
            // `currentSrc` should be a string, but can be `undefined` in IE,
            // !! operator validates the value is not undefined/null/""
            imgCached: !!this.imageRef.current.currentSrc,
          })
        )
      })
    }
  }

  handleImageLoaded() {
    activateCacheForImage(this.props)

    this.setState({ imgLoaded: true })

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
      backgroundColor,
      durationFadeIn,
      Tag,
      itemProp,
      loading,
    } = convertProps(this.props)

    const shouldReveal = this.state.fadeIn === false || this.state.imgLoaded
    const shouldFadeIn = this.state.fadeIn === true && !this.state.imgCached

    const imageStyle = {
      opacity: shouldReveal ? 1 : 0,
      transition: shouldFadeIn ? `opacity ${durationFadeIn}ms` : `none`,
      ...imgStyle,
    }

    const bgColor =
      typeof backgroundColor === `boolean` ? `lightgray` : backgroundColor

    const delayHideStyle = {
      transitionDelay: `${durationFadeIn}ms`,
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

    if (fluid) {
      const image = fluid

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
            <Img src={image.base64} {...placeholderImageProps} />
          )}

          {/* Show the traced SVG image. */}
          {image.tracedSVG && (
            <Img src={image.tracedSVG} {...placeholderImageProps} />
          )}

          {/* Once the image is visible (or the browser doesn't support IntersectionObserver), start downloading the image */}
          {this.state.isVisible && (
            <picture>
              {image.srcSetWebp && (
                <source
                  type={`image/webp`}
                  srcSet={image.srcSetWebp}
                  sizes={image.sizes}
                />
              )}

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
                loading={loading}
              />
            </picture>
          )}

          {/* Show the original image during server-side rendering if JavaScript is disabled */}
          {this.addNoScript && (
            <noscript
              dangerouslySetInnerHTML={{
                __html: noscriptImg({
                  alt,
                  title,
                  loading,
                  ...image,
                }),
              }}
            />
          )}
        </Tag>
      )
    }

    if (fixed) {
      const image = fixed
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
            <Img src={image.base64} {...placeholderImageProps} />
          )}

          {/* Show the traced SVG image. */}
          {image.tracedSVG && (
            <Img src={image.tracedSVG} {...placeholderImageProps} />
          )}

          {/* Once the image is visible, start downloading the image */}
          {this.state.isVisible && (
            <picture>
              {image.srcSetWebp && (
                <source
                  type={`image/webp`}
                  srcSet={image.srcSetWebp}
                  sizes={image.sizes}
                />
              )}

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
                loading={loading}
              />
            </picture>
          )}

          {/* Show the original image during server-side rendering if JavaScript is disabled */}
          {this.addNoScript && (
            <noscript
              dangerouslySetInnerHTML={{
                __html: noscriptImg({
                  alt,
                  title,
                  loading,
                  ...image,
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
  fadeIn: true,
  durationFadeIn: 500,
  alt: ``,
  Tag: `div`,
  // We set it to `lazy` by default because it's best to default to a performant
  // setting and let the user "opt out" to `eager`
  loading: `lazy`,
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
})

Image.propTypes = {
  resolutions: fixedObject,
  sizes: fluidObject,
  fixed: fixedObject,
  fluid: fluidObject,
  fadeIn: PropTypes.bool,
  durationFadeIn: PropTypes.number,
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
  loading: PropTypes.oneOf([`auto`, `lazy`, `eager`]),
}

export default Image
