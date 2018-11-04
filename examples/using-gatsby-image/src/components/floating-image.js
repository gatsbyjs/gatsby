import React from "react"
import Img from "gatsby-image"
import styled from "react-emotion"

import { rhythm, options } from "../utils/typography"
import presets from "../utils/presets"

const Image = styled(Img)`
  display: block;
  float: right;
  margin-bottom: ${rhythm(options.blockMarginBottom * 2)};
  margin-left: ${rhythm(options.blockMarginBottom * 2)};
  margin-right: -${presets.gutter.default};

  ${presets.Phablet} {
    display: none;
  }
`

const ImageDesktop = styled(Image)`
  display: none;

  ${presets.Phablet} {
    display: block;
  }
`

const FloatingImage = ({
  imageMobile,
  imageDesktop,
  title,
  backgroundColor,
}) => (
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
    <Image
      fixed={imageMobile}
      backgroundColor={backgroundColor ? backgroundColor : false}
      style={{ display: `inherit` }}
      title={title}
    />
    <ImageDesktop
      fixed={imageDesktop}
      backgroundColor={backgroundColor ? backgroundColor : false}
      style={{ display: `inherit` }}
      title={title}
    />
  </React.Fragment>
)

export default FloatingImage
