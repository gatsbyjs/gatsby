import React from "react"
import Img from "gatsby-image"
import styled from "react-emotion"

import { rhythm, options } from "../utils/typography"
import presets from "../utils/presets"

const Image = styled(Img)({
  marginBottom: rhythm(options.blockMarginBottom * 2),
  marginLeft: rhythm(options.blockMarginBottom * 2),
  marginRight: -20,
  float: `right`,
  [presets.Phablet]: {
    display: `none`,
  },
})

const ImageDesktop = styled(Image)({
  display: `none`,
  [presets.Phablet]: {
    display: `inline-block`,
  },
})

const FloatingImage = ({ imageMobile, imageDesktop }) => (
  <React.Fragment>
    <Image style={{ display: `inherit` }} fixed={imageMobile} />
    <ImageDesktop style={{ display: `inherit` }} fixed={imageDesktop} />
  </React.Fragment>
)

export default FloatingImage
