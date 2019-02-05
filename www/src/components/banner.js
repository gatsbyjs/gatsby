import React from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"

import presets, { colors } from "../utils/presets"
import { rhythm, scale, options } from "../utils/typography"

const horizontalPadding = rhythm(1 / 2)
const backgroundColor = props =>
  props.background ? props.background : colors.gatsby

const BannerContainer = styled(`div`)`
  background-color: ${props => backgroundColor(props)};
  height: ${presets.bannerHeight};
  position: fixed;
  width: 100%;
  z-index: 3;
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
`

const InnerContainer = styled(`div`)`
  align-items: center;
  display: flex;
  height: ${presets.bannerHeight};
  overflow-x: auto;
  mask-image: ${`linear-gradient(to right, transparent, ${props =>
    backgroundColor(props)} ${horizontalPadding}, ${props =>
    backgroundColor(props)} 96%, transparent)`};
`

const Content = styled(`div`)`
  color: ${colors.ui.bright};
  font-family: ${options.headerFontFamily.join(`,`)};
  font-size: ${scale(-1 / 5).fontSize};
  padding-left: ${horizontalPadding};
  padding-right: ${horizontalPadding};
  -webkit-font-smoothing: antialiased;
  white-space: nowrap;
`

const Banner = ({ children, background }) => (
  <BannerContainer background={background} className="banner">
    <InnerContainer>{children && <Content>{children}</Content>}</InnerContainer>
  </BannerContainer>
)

Banner.propTypes = {
  children: PropTypes.node.isRequired,
  background: PropTypes.any,
}

export default Banner
