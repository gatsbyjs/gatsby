import React from "react"
import PropTypes from "prop-types"

// TODO responsiveSizes => sizes, responsiveResolution => resolutions
// TODO support adding node_modules/gatsby-image as place to scan for graphql fragments to gatsby-plugin-sharp and gatsby-source-contentful
// TODO add fragments here with and without base64 in fragments file so not included in pages.

const imageCache = {}
const inImageCache = props => {
  // Find src
  const src = props.responsiveSizes
    ? props.responsiveSizes.src
    : props.responsiveResolution.src

  if (imageCache[src]) {
    return true
  } else {
    imageCache[src] = true
    return false
  }
}

let io
const listeners = []
if (typeof window !== `undefined` && window.IntersectionObserver) {
  io = new window.IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        listeners.forEach(l => {
          if (l[0] === entry.target) {
            if (entry.isIntersecting) {
              io.unobserve(l[0])
              l[1]()
            }
          }
        })
      })
    },
    { rootMargin: `200px` }
  )
}

const listenToIntersections = (el, cb) => {
  io.observe(el)
  listeners.push([el, cb])
}

const Img = props => {
  const { opacity, onLoad, transitionDelay = ``, ...otherProps } = props
  return (
    <img
      {...otherProps}
      onLoad={onLoad}
      style={{
        position: `absolute`,
        top: 0,
        left: 0,
        transition: `opacity 0.5s`,
        transitionDelay,
        opacity,
        width: `100%`,
        height: `100%`,
        objectFit: `cover`,
        objectPosition: `center`,
      }}
    />
  )
}

Img.propTypes = {
  opacity: PropTypes.number,
  transitionDelay: PropTypes.string,
  onLoad: PropTypes.func,
}

class Image extends React.Component {
  constructor(props) {
    super(props)

    // If this browser doesn't support the IntersectionObserver API
    // we default to start downloading the image right away.
    let isVisible = true
    let imgLoaded = true
    let IOSupported = false

    // If this image has already been loaded before then we can assume it's
    // already in the browser cache so it's cheap to just show directly.
    const seenBefore = inImageCache(props)

    if (
      !seenBefore &&
      typeof window !== `undefined` &&
      window.IntersectionObserver
    ) {
      isVisible = false
      imgLoaded = false
      IOSupported = true
    }

    // Always don't render image while server rendering
    if (typeof window === `undefined`) {
      isVisible = false
      imgLoaded = false
    }

    this.state = {
      isVisible,
      imgLoaded,
      IOSupported,
    }

    this.handleRef = this.handleRef.bind(this)
  }

  handleRef(ref) {
    if (this.state.IOSupported && ref) {
      listenToIntersections(ref, () => {
        this.setState({ isVisible: true, imgLoaded: false })
      })
    }
  }

  render() {
    const {
      title,
      alt,
      className,
      style,
      responsiveSizes,
      responsiveResolution,
      backgroundColor,
    } = this.props

    if (responsiveSizes) {
      const image = responsiveSizes
      return (
        <div
          className={`${className ? className : ``} gatsby-image-wrapper`}
          style={{
            position: `relative`,
            overflow: `hidden`,
            ...style,
          }}
          ref={this.handleRef}
        >
          {/* Preserve the aspect ratio. */}
          <div
            style={{
              width: `100%`,
              paddingBottom: `${100 / image.aspectRatio}%`,
            }}
          />

          {/* Show the blury base64 image. */}
          {image.base64 && (
            <Img
              alt={alt}
              title={title}
              src={image.base64}
              opacity={!this.state.imgLoaded ? 1 : 0}
              transitionDelay={`0.25s`}
            />
          )}

          {/* Show a solid background color. */}
          {backgroundColor && (
            <div
              title={title}
              style={{
                backgroundColor: backgroundColor,
                position: `absolute`,
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
              }}
            />
          )}

          {/* Once the image is visible (or the browser doesn't support IntersectionObserver), start downloading the image */}
          {this.state.isVisible && (
            <Img
              alt={alt}
              title={title}
              srcSet={image.srcSet}
              src={image.src}
              sizes={image.sizes}
              opacity={
                this.state.imgLoaded || this.props.fadeIn === false ? 1 : 0
              }
              onLoad={() =>
                this.state.IOSupported && this.setState({ imgLoaded: true })}
            />
          )}
        </div>
      )
    }

    if (responsiveResolution) {
      const image = responsiveResolution
      return (
        <div
          className={`${className ? className : ``} gatsby-image-wrapper`}
          style={{
            position: `relative`,
            overflow: `hidden`,
            width: image.width,
            height: image.height,
            background: `lightgray`,
            ...style,
          }}
          ref={this.handleRef}
        >
          {/* Show the blury base64 image. */}
          {image.base64 && (
            <Img
              alt={alt}
              title={title}
              src={image.base64}
              opacity={!this.state.imgLoaded ? 1 : 0}
              transitionDelay={`0.25s`}
            />
          )}

          {/* Show a solid background color. */}
          {backgroundColor && (
            <div
              title={title}
              style={{
                backgroundColor: backgroundColor,
                width: image.width,
                height: image.height,
              }}
            />
          )}

          {/* Once the image is visible, start downloading the image */}
          {this.state.isVisible && (
            <Img
              alt={alt}
              title={title}
              width={image.width}
              height={image.height}
              srcSet={image.srcSet}
              src={image.src}
              opacity={
                this.state.imgLoaded || this.props.fadeIn === false ? 1 : 0
              }
              onLoad={() => this.setState({ imgLoaded: true })}
            />
          )}
        </div>
      )
    }

    return null
  }
}

Image.defaultProps = {
  fadeIn: true,
  alt: ``,
}

Image.propTypes = {
  responsiveResolution: PropTypes.object,
  responsiveSizes: PropTypes.object,
  fadeIn: PropTypes.bool,
  title: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), // Support Glamor's css prop.
  style: PropTypes.object,
  backgroundColor: PropTypes.string,
}

export default Image
