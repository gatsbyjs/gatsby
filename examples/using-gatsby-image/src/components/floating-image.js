import React from "react"
import Img from "gatsby-image"

import { rhythm, options } from "../utils/typography"

const FloatingImage = ({ imageMobile, imageDesktop }) => (
  <React.Fragment>
    <Img
      style={{ display: `inherit` }}
      css={{
        marginBottom: rhythm(options.blockMarginBottom * 2),
        marginLeft: rhythm(options.blockMarginBottom * 2),
        marginRight: -20,
        float: `right`,
        "&": {
          "@media (min-width: 500px)": {
            display: `none`,
          },
        },
      }}
      fixed={imageMobile}
    />
    <Img
      style={{ display: `inherit` }}
      css={{
        marginBottom: rhythm(options.blockMarginBottom * 2),
        marginLeft: rhythm(options.blockMarginBottom * 2),
        float: `right`,
        display: `none`,
        "@media (min-width: 500px)": {
          display: `inline-block`,
          marginRight: -20,
        },
      }}
      fixed={imageDesktop}
    />
  </React.Fragment>
)

export default FloatingImage
