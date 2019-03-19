import React from "react"
import PropTypes from "prop-types"
import Image from "../index"

// Dynamically load polyfill for object-fit/object-position if needed (e.g. in IE)
const testImg = document.createElement(`img`)
if (
  typeof testImg.style.objectFit === `undefined` ||
  typeof testImg.style.objectPosition === `undefined`
) {
  import(`object-fit-images`).then(({ default: ObjectFitImages }) =>
    ObjectFitImages()
  )
}

function ImageWithIEPolyfill({ objectFit, objectPosition, ...props }) {
  return (
    <Image
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

ImageWithIEPolyfill.propTypes = {
  objectFit: PropTypes.string,
  objectPosition: PropTypes.string,
}

ImageWithIEPolyfill.defaultProps = {
  objectFit: `cover`,
  objectPosition: `50% 50%`,
}

export default ImageWithIEPolyfill
