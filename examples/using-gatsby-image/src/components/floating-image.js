import React from "react"
import Img from "gatsby-image"
import styled from "react-emotion"

import { rhythm, options } from "../utils/typography"
import presets from "../utils/presets"

const Image = styled(Img)({
  display: `inline-block`,
  float: `right`,
  marginBottom: rhythm(options.blockMarginBottom * 2),
  marginLeft: rhythm(options.blockMarginBottom * 2),
  marginRight: -20,
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
    {/*
        gatsby-image sets a couple of inline styles on its outer
        container and allows overriding via its `style` prop. One
        of these inline styles is `display: inline-block´.

        In this case we have two images, one for mobile and one
        for desktop, and toggle their visibility with `display`,
        so we need to override the gatsby-image default to make
        our own styles work.

        https://www.gatsbyjs.org/packages/gatsby-image/#gatsby-image-props
    */}
    <Image style={{ display: `inherit` }} fixed={imageMobile} />
    <ImageDesktop style={{ display: `inherit` }} fixed={imageDesktop} />
  </React.Fragment>
)

export default FloatingImage
