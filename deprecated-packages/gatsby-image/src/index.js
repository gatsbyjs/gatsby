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
  const convertedProps = { ...props }
  const { resolutions, sizes, critical } = convertedProps

  if (resolutions) {
    convertedProps.fixed = resolutions
    logDeprecationNotice(`resolutions`, `the gatsby-image v2 prop "fixed"`)
    delete convertedProps.resolutions
  }
  if (sizes) {
    convertedProps.fluid = sizes
    logDeprecationNotice(`sizes`, `the gatsby-image v2 prop "fluid"`)
    delete convertedProps.sizes
  }

  if (critical) {
    logDeprecationNotice(`critical`, `the native "loading" attribute`)
    convertedProps.loading = `eager`
  }

  // convert fluid & fixed to arrays so we only have to work with arrays
  if (convertedProps.fluid) {
    convertedProps.fluid = groupByMedia([].concat(convertedProps.fluid))
  }
  if (convertedProps.fixed) {
    convertedProps.fixed = groupByMedia([].concat(convertedProps.fixed))
  }

  return convertedProps
}

/**
 * Checks if fluid or fixed are art-direction arrays.
 *
 * @param currentData  {{media?: string}[]}   The props to check for images.
 * @return {boolean}
 */
const hasArtDirectionSupport = currentData =>
  !!currentData &&
  Array.isArray(currentData) &&
  currentData.some(image => typeof image.media !== `undefined`)

/**
 * Tries to detect if a media query matches the current viewport.
 * @property media   {{media?: string}}  A media query string.
 * @return {boolean}
 */
const matchesMedia = ({ media }) =>
  media ? isBrowser && !!window.matchMedia(media).matches : false

/**
 * Find the source of an image to use as a key in the image cache.
 * Use `the first image in either `fixed` or `fluid`
 * @param {{fluid: {src: string, media?: string}[], fixed: {src: string, media?: string}[]}} args
 * @return {string?} Returns image src or undefined it not given.
 */
const getImageCacheKey = ({ fluid, fixed }) => {
  const srcData = getCurrentSrcData(fluid || fixed || [])

  return srcData && srcData.src
}

/**
 * Returns the current src - Preferably with art-direction support.
 * @param currentData  {{media?: string}[], maxWidth?: Number, maxHeight?: Number}   The fluid or fixed image array.
 * @return {{src: string, media?: string, maxWidth?: Number, maxHeight?: Number}}
 */
const getCurrentSrcData = currentData => {
  if (isBrowser && hasArtDirectionSupport(currentData)) {
    // Do we have an image for the current Viewport?
    const foundMedia = currentData.findIndex(matchesMedia)
    if (foundMedia !== -1) {
      return currentData[foundMedia]
    }

    // No media matches, select first element without a media condition
    const noMedia = currentData.findIndex(
      image => typeof image.media === `undefined`
    )
    if (noMedia !== -1) {
      return currentData[noMedia]
    }
  }
  // Else return the first image.
  return currentData[0]
}

// Cache if we've seen an image before so we don't bother with
// lazy-loading & fading in on subsequent mounts.
const imageCache = Object.create({})
const inImageCache = props => {
  const convertedProps = convertProps(props)

  const cacheKey = getImageCacheKey(convertedProps)

  return imageCache[cacheKey] || false
}

const activateCacheForImage = props => {
  const convertedProps = convertProps(props)

  const cacheKey = getImageCacheKey(convertedProps)

  if (cacheKey) {
    imageCache[cacheKey] = true
  }
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
      {srcSet && <source media={media} srcSet={srcSet} sizes={sizes} />}
    </React.Fragment>
  ))
}

// Return an array ordered by elements having a media prop, does not use
// native sort, as a stable sort is not guaranteed by all browsers/versions
function groupByMedia(imageVariants) {
  const withMedia = []
  const without = []
  imageVariants.forEach(variant =>
    (variant.media ? withMedia : without).push(variant)
  )

  if (without.length > 1 && process.env.NODE_ENV !== `production`) {
    console.warn(
      `We've found ${without.length} sources without a media property. They might be ignored by the browser, see: https://www.gatsbyjs.com/plugins/gatsby-image/#art-directing-multiple-images`
    )
  }

  return [...withMedia, ...without]
}

function generateTracedSVGSources(imageVariants) {
  return imageVariants.map(({ src, media, tracedSVG }) => (
    <source key={src} media={media} srcSet={tracedSVG} />
  ))
}

function generateBase64Sources(imageVariants) {
  return imageVariants.map(({ src, media, base64 }) => (
    <source key={src} media={media} srcSet={base64} />
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
  return imageVariants
    .map(
      variant =>
        (variant.srcSetWebp ? generateNoscriptSource(variant, true) : ``) +
        generateNoscriptSource(variant)
    )
    .join(``)
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
  const loading = props.loading ? `loading="${props.loading}" ` : ``
  const draggable = props.draggable ? `draggable="${props.draggable}" ` : ``

  const sources = generateNoscriptSources(props.imageVariants)

  return `<picture>${sources}<img ${loading}${width}${height}${sizes}${srcSet}${src}${alt}${title}${crossOrigin}${draggable}style="position:absolute;top:0;left:0;opacity:1;width:100%;height:100%;object-fit:cover;object-position:center"/></picture>`
}

// Earlier versions of gatsby-image during the 2.x cycle did not wrap
// the `Img` component in a `picture` element. This maintains compatibility
// until a breaking change can be introduced in the next major release
const Placeholder = React.forwardRef((props, ref) => {
  const { src, imageVariants, generateSources, spreadProps, ariaHidden } = props

  const baseImage = (
    <Img ref={ref} src={src} {...spreadProps} ariaHidden={ariaHidden} />
  )

  return imageVariants.length > 1 ? (
    <picture>
      {generateSources(imageVariants)}
      {baseImage}
    </picture>
  ) : (
    baseImage
  )
})

const Img = React.forwardRef((props, ref) => {
  const {
    sizes,
    srcSet,
    src,
    style,
    onLoad,
    onError,
    loading,
    draggable,
    // `ariaHidden`props is used to exclude placeholders from the accessibility tree.
    ariaHidden,
    ...otherProps
  } = props

  return (
    <img
      aria-hidden={ariaHidden}
      sizes={sizes}
      srcSet={srcSet}
      src={src}
      {...otherProps}
      onLoad={onLoad}
      onError={onError}
      ref={ref}
      loading={loading}
      draggable={draggable}
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

    this.isCritical = props.loading === `eager` || props.critical

    this.addNoScript = !(this.isCritical && !props.fadeIn)
    this.useIOSupport =
      !hasNativeLazyLoadSupport &&
      hasIOSupport &&
      !this.isCritical &&
      !this.seenBefore

    const isVisible =
      this.isCritical ||
      (isBrowser && (hasNativeLazyLoadSupport || !this.useIOSupport))

    this.state = {
      isVisible,
      imgLoaded: false,
      imgCached: false,
      fadeIn: !this.seenBefore && props.fadeIn,
      isHydrated: false,
    }

    this.imageRef = React.createRef()
    this.placeholderRef = props.placeholderRef || React.createRef()
    this.handleImageLoaded = this.handleImageLoaded.bind(this)
    this.handleRef = this.handleRef.bind(this)
  }

  componentDidMount() {
    this.setState({
      isHydrated: isBrowser,
    })

    if (this.state.isVisible && typeof this.props.onStartLoad === `function`) {
      this.props.onStartLoad({ wasCached: inImageCache(this.props) })
    }
    if (this.isCritical) {
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
        this.setState({ isVisible: true }, () => {
          this.setState({
            imgLoaded: imageInCache,
            // `currentSrc` should be a string, but can be `undefined` in IE,
            // !! operator validates the value is not undefined/null/""
            // for lazyloaded components this might be null
            // TODO fix imgCached behaviour as it's now false when it's lazyloaded
            imgCached: !!(
              this.imageRef.current && this.imageRef.current.currentSrc
            ),
          })
        })
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
      draggable,
    } = convertProps(this.props)

    const imageVariants = fluid || fixed
    // Abort early if missing image data (#25371)
    if (!imageVariants) {
      return null
    }

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
      itemProp,
    }

    // Initial client render state needs to match SSR until hydration finishes.
    // Once hydration completes, render again to update to the correct image.
    // `imageVariants` is always an Array type at this point due to `convertProps()`
    const image = !this.state.isHydrated
      ? imageVariants[0]
      : getCurrentSrcData(imageVariants)

    if (fluid) {
      return (
        <Tag
          className={`${className ? className : ``} gatsby-image-wrapper`}
          style={{
            position: `relative`,
            overflow: `hidden`,
            maxWidth: image.maxWidth ? `${image.maxWidth}px` : null,
            maxHeight: image.maxHeight ? `${image.maxHeight}px` : null,
            ...style,
          }}
          ref={this.handleRef}
          key={`fluid-${JSON.stringify(image.srcSet)}`}
        >
          {/* Preserve the aspect ratio. */}
          <Tag
            aria-hidden
            style={{
              width: `100%`,
              paddingBottom: `${100 / image.aspectRatio}%`,
            }}
          />

          {/* Show a solid background color. */}
          {bgColor && (
            <Tag
              aria-hidden
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
            <Placeholder
              ariaHidden
              ref={this.placeholderRef}
              src={image.base64}
              spreadProps={placeholderImageProps}
              imageVariants={imageVariants}
              generateSources={generateBase64Sources}
            />
          )}

          {/* Show the traced SVG image. */}
          {image.tracedSVG && (
            <Placeholder
              ariaHidden
              ref={this.placeholderRef}
              src={image.tracedSVG}
              spreadProps={placeholderImageProps}
              imageVariants={imageVariants}
              generateSources={generateTracedSVGSources}
            />
          )}

          {/* Once the image is visible (or the browser doesn't support IntersectionObserver), start downloading the image */}
          {this.state.isVisible && (
            <picture>
              {generateImageSources(imageVariants)}
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
                draggable={draggable}
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
                  imageVariants,
                }),
              }}
            />
          )}
        </Tag>
      )
    }

    if (fixed) {
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
              aria-hidden
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
            <Placeholder
              ariaHidden
              ref={this.placeholderRef}
              src={image.base64}
              spreadProps={placeholderImageProps}
              imageVariants={imageVariants}
              generateSources={generateBase64Sources}
            />
          )}

          {/* Show the traced SVG image. */}
          {image.tracedSVG && (
            <Placeholder
              ariaHidden
              ref={this.placeholderRef}
              src={image.tracedSVG}
              spreadProps={placeholderImageProps}
              imageVariants={imageVariants}
              generateSources={generateTracedSVGSources}
            />
          )}

          {/* Once the image is visible, start downloading the image */}
          {this.state.isVisible && (
            <picture>
              {generateImageSources(imageVariants)}
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
                draggable={draggable}
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
  maxWidth: PropTypes.number,
  maxHeight: PropTypes.number,
})

function requireFixedOrFluid(originalPropTypes) {
  return (props, propName, componentName) => {
    if (!props.fixed && !props.fluid) {
      throw new Error(
        `The prop \`fluid\` or \`fixed\` is marked as required in \`${componentName}\`, but their values are both \`undefined\`.`
      )
    }

    PropTypes.checkPropTypes(
      { [propName]: originalPropTypes },
      props,
      `prop`,
      componentName
    )
  }
}

// If you modify these propTypes, please don't forget to update following files as well:
// https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-image/index.d.ts
// https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-image/README.md#gatsby-image-props
// https://github.com/gatsbyjs/gatsby/blob/master/docs/docs/gatsby-image.md#gatsby-image-props
Image.propTypes = {
  resolutions: fixedObject,
  sizes: fluidObject,
  fixed: requireFixedOrFluid(
    PropTypes.oneOfType([fixedObject, PropTypes.arrayOf(fixedObject)])
  ),
  fluid: requireFixedOrFluid(
    PropTypes.oneOfType([fluidObject, PropTypes.arrayOf(fluidObject)])
  ),
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
  draggable: PropTypes.bool,
}

export default Image
