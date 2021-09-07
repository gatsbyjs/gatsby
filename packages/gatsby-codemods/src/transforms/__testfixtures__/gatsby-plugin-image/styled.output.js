import React from "react"
import { GatsbyImage } from "gatsby-plugin-image";
import styled from "@emotion/styled"

import { rhythm, options } from "../utils/typography"
import { mq, gutter } from "../utils/presets"

const Image = styled(GatsbyImage)`
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