import React from "react"
import PropTypes from "prop-types"
import Image from "gatsby-image"

const svgAssetsContext = require.context(
  `!file-loader!svgo-loader?{"plugins":[{"removeViewBox":false}]}!../assets`,
  true,
  /^\.\/.*\.svg$/
)

class SVGGatsbyImage extends Image {
  render() {
    const { fluid, alt, ...rest } = this.props

    if (!this.state.isVisible) {
      return <div ref={this.handleRef} />
    }

    return (
      <img
        src={svgAssetsContext(`./${fluid.src}`)}
        alt={alt}
        ref={this.imageRef}
        {...rest}
      />
    )
  }
}

SVGGatsbyImage.propTypes = {
  alt: PropTypes.string,
}

SVGGatsbyImage.defaultProps = {
  alt: ``,
}

const LazySVGImg = ({ src, ...rest }) => (
  <SVGGatsbyImage fluid={{ src }} {...rest} />
)

LazySVGImg.propTypes = {
  src: PropTypes.string,
}

export default LazySVGImg
