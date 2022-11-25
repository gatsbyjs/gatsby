import React, { Component, createRef, forwardRef } from "react"
import PropTypes from "prop-types"
import Image from "../index"

class ImageWithIEPolyfill extends Component {
  imageRef = this.props.innerRef || createRef()
  placeholderRef = createRef()

  // Load object-fit/position polyfill if required (e.g. in IE)
  componentDidMount() {
    const testImg = document.createElement(`img`)
    if (
      typeof testImg.style.objectFit === `undefined` ||
      typeof testImg.style.objectPosition === `undefined`
    ) {
      import(`object-fit-images`).then(({ default: ObjectFitImages }) => {
        ObjectFitImages(this.imageRef.current.imageRef.current)
        ObjectFitImages(this.placeholderRef.current)
      })
    }
  }

  render() {
    const { objectFit, objectPosition, ...props } = this.props

    const polyfillStyle = {
      objectFit: objectFit,
      objectPosition: objectPosition,
      fontFamily: `"object-fit: ${objectFit}; object-position: ${objectPosition}"`,
    }

    return (
      <Image
        ref={this.imageRef}
        placeholderRef={this.placeholderRef}
        {...props}
        imgStyle={{
          ...props.imgStyle,
          ...polyfillStyle,
        }}
        placeholderStyle={{
          ...props.placeholderStyle,
          ...polyfillStyle,
        }}
      />
    )
  }
}

// If you modify these propTypes, please don't forget to update following files as well:
// https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-image/withIEPolyfill/index.d.ts
// https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-image/README.md#gatsby-image-props
// https://github.com/gatsbyjs/gatsby/blob/master/docs/docs/gatsby-image.md#gatsby-image-props
ImageWithIEPolyfill.propTypes = {
  objectFit: PropTypes.string,
  objectPosition: PropTypes.string,
}

ImageWithIEPolyfill.defaultProps = {
  objectFit: `cover`,
  objectPosition: `50% 50%`,
}

export default forwardRef((props, ref) => (
  <ImageWithIEPolyfill {...props} innerRef={ref} />
))
