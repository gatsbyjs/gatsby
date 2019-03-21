import React, { Component, createRef } from "react"
import PropTypes from "prop-types"
import Image from "../index"

class ImageWithIEPolyfill extends Component {
  constructor(props) {
    super(props)
    this.imageRef = createRef()
  }

  // Load object-fit/position polyfill if required (e.g. in IE)
  componentDidMount() {
    const testImg = document.createElement(`img`)
    if (
      typeof testImg.style.objectFit === `undefined` ||
      typeof testImg.style.objectPosition === `undefined`
    ) {
      import(`object-fit-images`).then(({ default: ObjectFitImages }) =>
        ObjectFitImages(this.imageRef.current.querySelector(`img`))
      )
    }
  }

  render() {
    const { objectFit, objectPosition, ...props } = this.props

    return (
      <Image
        ref={this.imageRef}
        {...props}
        imgStyle={{
          ...props.imgStyle,
          objectFit: objectFit,
          objectPosition: objectPosition,
          fontFamily: `"object-fit: ${objectFit}; object-position: ${objectPosition}"`,
        }}
      />
    )
  }
}

ImageWithIEPolyfill.propTypes = {
  objectFit: PropTypes.string,
  objectPosition: PropTypes.string,
}

ImageWithIEPolyfill.defaultProps = {
  objectFit: `cover`,
  objectPosition: `50% 50%`,
}

export default ImageWithIEPolyfill
