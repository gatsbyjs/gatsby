import React from "react"
import PropTypes from "prop-types"

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
  const { opacity, onLoad, ...otherProps } = props
  return (
    <img
      {...otherProps}
      onLoad={onLoad}
      style={{
        position: `absolute`,
        top: 0,
        left: 0,
        transition: `opacity 0.5s`,
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
  onLoad: PropTypes.func
}

class Image extends React.Component {
  constructor(props) {
    super(props)

    // If this browser doesn't support the IntersectionObserver API
    // we just start downloading the image right away.
    let isVisible = true
    if (typeof window !== `undefined` && window.IntersectionObserver) {
      isVisible = false
    }

    this.state = {
      isVisible,
    }

    this.handleRef = this.handleRef.bind(this)
  }

  handleRef(ref) {
    if (window.IntersectionObserver && ref) {
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
            <Img alt={alt} title={title} src={image.base64} opacity={1} />
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

          {/* Once the image is visible, start downloading the image */}
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
              onLoad={() => this.setState({ imgLoaded: true })}
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
            <Img alt={alt} title={title} src={image.base64} opacity={1} />
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
  wrapperClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), // Support Glamor's css prop.
}

export default Image
