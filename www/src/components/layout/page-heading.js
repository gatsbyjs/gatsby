import React from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"

import { space, mediaQueries } from "../../gatsby-plugin-theme-ui"
import { svgStyles } from "../../utils/styles"

const PageHeadingContainer = styled(`header`)`
  padding: ${props => props.theme.space[6]};

  ${mediaQueries.md} {
    left: 0;
    position: fixed;
    padding: 0;
    top: ${`calc(${props => props.theme.sizes.bannerHeight} + ${props =>
      props.theme.sizes.headerHeight})`};
  }
`

const H1 = styled(`h1`)`
  align-items: center;
  color: ${props => props.theme.colors.lilac};
  display: flex;
  font-size: ${props => props.theme.fontSizes[5]};
  line-height: ${props => props.theme.lineHeights.solid};
  margin: 0;
  position: relative;
  width: 100%;

  ${mediaQueries.md} {
    transform: rotate(-90deg)
      translate(calc(-100% - ${props => props.theme.space[7]}), ${space[4]});
    transform-origin: top left;
  }

  :after {
    bottom: -${props => props.theme.space[4]};
    content: attr(data-title);
    display: none;
    font-size: 12rem;
    position: absolute;
    right: -${props => props.theme.space[3]};
    z-index: -1;
    color: ${props => props.theme.colors.purple[5]};

    ${mediaQueries.md} {
      display: block;
    }
  }
`

const Icon = styled(`span`)`
  display: flex;
  align-items: center;
  margin-right: ${props => props.theme.space[2]};

  svg {
    width: ${props => props.theme.space[7]};
    height: auto;
    margin: 0;
  }

  ${svgStyles.stroke}
  ${svgStyles.default}
`

const PageHeading = ({ title, icon }) => (
  <PageHeadingContainer>
    <H1 data-title={title}>
      <Icon dangerouslySetInnerHTML={{ __html: icon }} />
      {title}
    </H1>
  </PageHeadingContainer>
)

PageHeading.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.string,
}

export default PageHeading
