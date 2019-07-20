/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import styled from "@emotion/styled"
import { OutboundLink } from "gatsby-plugin-google-analytics"

import { colors, space, sizes, fonts } from "../utils/presets"

const horizontalPadding = space[6]
const backgroundColor = colors.purple[90]

const InnerContainer = styled(`div`)`
  align-items: center;
  display: flex;
  height: ${sizes.bannerHeight};
  overflow-x: auto;
  mask-image: ${`linear-gradient(to right, transparent, ${backgroundColor} ${horizontalPadding}, ${backgroundColor} 96%, transparent)`};
`

const Content = styled(`div`)`
  color: ${colors.whiteFade[80]};
  font-family: ${fonts.header};
  padding-left: ${horizontalPadding};
  padding-right: ${horizontalPadding};
  -webkit-font-smoothing: antialiased;
  white-space: nowrap;

  a {
    color: ${colors.white};
    border-bottom: 1px solid ${colors.white};
  }

  a:hover {
    color: ${colors.white};
    border-bottom-color: ${colors.white}a0;
  }
`

const Banner = () => (
  <aside
    className="banner"
    sx={{
      backgroundColor: `banner`,
      height: `bannerHeight`,
      position: `fixed`,
      width: `100%`,
      zIndex: `banner`,
      px: `env(safe-area-inset-left)`,
    }}
  >
    <InnerContainer>
      <Content>
        {`Using Gatsby for your clients or team? Start 14-day free trial of `}
        <OutboundLink href="https://www.gatsbyjs.com/preview">
          Gatsby Preview
        </OutboundLink>
      </Content>
    </InnerContainer>
  </aside>
)

export default Banner
