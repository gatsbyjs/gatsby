import React from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"

import presets, { colors } from "../../utils/presets"
import { rhythm, scale, options } from "../../utils/typography"

const horizontalPadding = rhythm(1 / 2)
const backgroundColor = props =>
  props.background ? props.background : colors.gatsby

const TopBannerContainer = styled("div")(props => ({
  backgroundColor: backgroundColor(props),
  height: presets.bannerHeight,
  position: `fixed`,
  width: `100%`,
  zIndex: 3,
}))

const InnerContainer = styled("div")(props => ({
  alignItems: `center`,
  display: `flex`,
  height: presets.bannerHeight,
  overflowX: `auto`,
  maskImage: `linear-gradient(to right, transparent, ${backgroundColor(
    props
  )} ${horizontalPadding}, ${backgroundColor} 96%, transparent)`,
}))

const Content = styled.div({
  color: colors.ui.bright,
  fontFamily: options.headerFontFamily.join(`,`),
  fontSize: scale(-1 / 5).fontSize,
  paddingLeft: horizontalPadding,
  paddingRight: horizontalPadding,
  WebkitFontSmoothing: `antialiased`,
  whiteSpace: `nowrap`,
})

const Link = styled.a({
  color: `#fff`,
  "& span": {
    display: `none`,
    [presets.Mobile]: { display: `inline` },
  },
})

const TopBanner = () => {
  return (
    <TopBannerContainer>
      <InnerContainer>
        <Content>
          These are the docs for v2.
          {` `}
          <Link href="https://v1.gatsbyjs.org/" css={{ color: `#fff` }}>
            View the v1 docs
            <span>
              {` `}
              instead
            </span>
          </Link>
          .
        </Content>
      </InnerContainer>
    </TopBannerContainer>
  )
}

TopBanner.propTypes = {}

export default TopBanner
