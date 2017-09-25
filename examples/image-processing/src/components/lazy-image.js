import React from "react"

let io
const listeners = []
if (typeof window !== `undefined` && window.IntersectionObserver) {
  io = new IntersectionObserver(
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
        margin: 0,
        width: `100%`,
        height: `100%`,
        objectFit: `cover`,
        objectPosition: `center`,
      }}
    />
  )
}

class Image extends React.Component {
  constructor() {
    super()

    // If this browser doesn't support the IntersectionObserver API
    // we just start downloading the image right away.
    let isVisible = true
    if (typeof window !== `undefined` && window.IntersectionObserver) {
      isVisible = false
    }

    this.state = {
      isVisible,
    }
  }

  handleRef = ref => {
    if (window.IntersectionObserver && ref) {
      listenToIntersections(ref, () => {
        this.setState({ isVisible: true, imgLoaded: false })
      })
    }
  }

  render() {
    console.log(this.props, this.state)
    if (this.props.responsiveSizes) {
      const image = this.props.responsiveSizes
      return (
        <div
          className={this.props.className}
          style={{
            position: `relative`,
            overflow: `hidden`,
            ...this.props.style,
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
          {image.base64 && <Img src={image.base64} opacity={1} />}

          {/* Once the image is visible, start downloading the image */}
          {this.state.isVisible && (
            <Img
              width={image.width}
              height={image.height}
              srcSet={image.srcSet}
              src={image.src}
              sizes={image.sizes}
              opacity={this.state.imgLoaded ? 1 : 0}
              onLoad={() => this.setState({ imgLoaded: true })}
            />
          )}
        </div>
      )
    }
    if (this.props.responsiveResolution) {
      const image = this.props.responsiveResolution
      return (
        <div
          className={this.props.className}
          style={{
            position: `relative`,
            overflow: `hidden`,
            width: image.width,
            height: image.height,
            background: `lightgray`,
            ...this.props.style,
          }}
          ref={this.handleRef}
        >
          {/* Show the blury base64 image. */}
          {image.base64 && <Img src={image.base64} opacity={1} />}

          {/* Once the image is visible, start downloading the image */}
          {this.state.isVisible && (
            <Img
              width={image.width}
              height={image.height}
              srcSet={image.srcSet}
              src={image.src}
              opacity={this.state.imgLoaded ? 1 : 0}
              onLoad={() => this.setState({ imgLoaded: true })}
            />
          )}
        </div>
      )
    }
  }
}

export default Image
