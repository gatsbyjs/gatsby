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
 * @return {string}
 */
const getImageSrcKey = ({ fluid, fixed }) => {
  const data = fluid ? getCurrentSrcData(fluid) : getCurrentSrcData(fixed)
  return data.src
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
  // Find src
  const src = getImageSrcKey(convertedProps)
  return imageCache[src] || false
}
const activateCacheForImage = props => {
  const convertedProps = convertProps(props)
  // Find src
  const src = getImageSrcKey(convertedProps)
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
      `We've found ${without.length} sources without a media property. They might be ignored by the browser, see: https://www.gatsbyjs.org/packages/gatsby-image/#art-directing-multiple-images`
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
    }
    this.imageRef = React.createRef()
    this.placeholderRef = props.placeholderRef || React.createRef()
    this.handleImageLoaded = this.handleImageLoaded.bind(this)
    this.handleRef = this.handleRef.bind(this)
  }
  componentDidMount() {
    if (this.state.isVisible && typeof this.props.onStartLoad === `function`) {
      this.props.onStartLoad({ wasCached: inImageCache(this.props) })
    }
  }
  componentWillUnmount() {
    if (this.cleanUpListeners) {
      this.cleanUpListeners()
    }
  }
  // Triggers when wrapper element mounts(has a ref) and after unmounting(null)
  handleRef(ref) {
    // Ignore calls from unmounts
    if (!ref) {
      return
    }
    // If the image can be detected in the browser already,
    // this will reveal it immediately and skip the placeholder transition.
    const setCachedState = () => {
      // 'img.currentSrc' may be a falsy value, empty string or undefined(IE).
      if (!this.imageRef.current) {
        return
      }
      // If image resides in the browser cache, this attribute is populated
      // without waiting on a network request response to update it.
      // Firefox does not behave in this way, no benefit there.
      let isCached = this.imageRef.current.currentSrc
      // For critical images 'img.complete' is more reliable
      if (this.isCritical) {
        isCached = this.imageRef.current.complete
      }
      if (isCached) {
        this.setState({
          imgCached: true,
        })
      }
    }
    // Newer instances(mounts) of this image may be cached, using a different
    // render path than Intersection Observer ('useIOSupport').
    // 'isVisible' guard skips this for already loaded art directed images.
    if (this.useIOSupport && !this.state.isVisible) {
      this.cleanUpListeners = listenToIntersections(ref, () => {
        const imageInCache = inImageCache(this.props)
        if (typeof this.props.onStartLoad === `function`) {
          this.props.onStartLoad({ wasCached: imageInCache })
        }
        // 'isVisible' enables loading the real image.
        // If internally cached, reveal image immediately, skipping transition.
        if (imageInCache) {
          this.setState({
            isVisible: true,
            imgCached: true,
          })
        } else {
          // Begin loading real image, then check if image is in browser cache.
          // Must first render with 'isVisible==true', then 'imageRef' exists.
          // 'imgCached' needs access to 'imageRef' to work.
          // Paired with 'imgLoaded' to avoid redundant animation frames.
          this.setState({ isVisible: true }, setCachedState)
        }
      })
    } else if (!this.state.imgCached) {
      setCachedState()
    }
  }
  handleImageLoaded() {
    activateCacheForImage(this.props)
    if (!this.state.imgLoaded) {
      this.setState({ imgLoaded: true })
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
      backgroundColor,
      durationFadeIn,
      Tag,
      itemProp,
      loading,
      draggable,
    } = convertProps(this.props)
    const shouldReveal = this.state.fadeIn === false || this.state.imgLoaded
    const shouldFadeIn = this.state.fadeIn === true && !this.state.imgCached

     // In a browser-cached scenario prevents rendering initial placeholder.
     // Instead renders a blank image container or backgroundColor placeholder.
     const shouldRevealPlaceholder = !isBrowser || this.state.isVisible
     const shouldRenderPlaceholder = !isBrowser || this.state.isVisible
     const shouldHidePlaceholder = this.state.imgCached || this.state.imgLoaded

     const imageStyle = {
       opacity: shouldReveal ? 1 : 0,
 @@ -486,7 +487,7 @@ class Image extends React.Component {
     }

     const imagePlaceholderStyle = {
       opacity: this.state.imgCached || this.state.imgLoaded ? 0 : 1,
       opacity: shouldHidePlaceholder ? 0 : 1,
       ...(shouldFadeIn && delayHideStyle),
       ...imgStyle,
       ...placeholderStyle,
 @@ -545,7 +546,7 @@ class Image extends React.Component {
           )}

           {/* Show the blurry base64 image. */}
           {shouldRevealPlaceholder && image.base64 && (
           {shouldRenderPlaceholder && image.base64 && (
             <Placeholder
               ariaHidden
               ref={this.placeholderRef}
 @@ -557,7 +558,7 @@ class Image extends React.Component {
           )}

           {/* Show the traced SVG image. */}
           {shouldRevealPlaceholder && image.tracedSVG && (
           {shouldRenderPlaceholder && image.tracedSVG && (
             <Placeholder
               ariaHidden
               ref={this.placeholderRef}
 @@ -648,7 +649,7 @@ class Image extends React.Component {
           )}

           {/* Show the blurry base64 image. */}
           {shouldRevealPlaceholder && image.base64 && (
           {shouldRenderPlaceholder && image.base64 && (
             <Placeholder
               ariaHidden
               ref={this.placeholderRef}
 @@ -660,7 +661,7 @@ class Image extends React.Component {
           )}

           {/* Show the traced SVG image. */}
           {shouldRevealPlaceholder && image.tracedSVG && (
           {shouldRenderPlaceholder && image.tracedSVG && (
             <Placeholder
               ariaHidden
               ref={this.placeholderRef}
