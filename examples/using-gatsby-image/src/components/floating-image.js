import React from "react"
import Img from "gatsby-image"
import styled from "@emotion/styled"

import { rhythm, options } from "../utils/typography"
import { mq, gutter } from "../utils/presets"

const Image = styled(Img)`
  display: block;
  float: right;
  margin-bottom: ${rhythm(options.blockMarginBottom * 2)};
  margin-left: ${rhythm(options.blockMarginBottom * 2)};
  margin-right: -${gutter.default};

  ${mq.tablet} {
    margin-right: -${gutter.tablet};
  }

  ${mq.desktop} {
    margin-right: -${gutter.desktop};
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

        https://www.gatsbyjs.com/plugins/gatsby-image/#gatsby-image-props
    */}
    <Image
      fixed={[
        imageMobile,
        {
          ...imageDesktop,
          media: mq.phablet.replace(`@media`, ``).trim(),
        },
      ]}
      backgroundColor={backgroundColor ? backgroundColor : false}
      title={title}
    />
  </React.Fragment>
)

export default FloatingImage
