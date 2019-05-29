import React from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"

import {
  colors,
  space,
  mediaQueries,
  sizes,
  lineHeights,
  fontSizes,
} from "../../utils/presets"
import { svgStyles } from "../../utils/styles"

const PageHeadingContainer = styled(`header`)`
  padding: ${space[6]};

  ${mediaQueries.md} {
    left: 0;
    position: fixed;
    padding: 0;
    top: ${`calc(${sizes.bannerHeight} + ${sizes.headerHeight})`};
  }
`

const H1 = styled(`h1`)`
  align-items: center;
  color: ${colors.lilac};
  display: flex;
  font-size: ${fontSizes[5]};
  line-height: ${lineHeights.solid};
  margin: 0;
  position: relative;
  width: 100%;

  ${mediaQueries.md} {
    transform: rotate(-90deg) translate(calc(-100% - ${space[7]}), ${space[4]});
    transform-origin: top left;
  }

  :after {
    bottom: -${space[4]};
    content: attr(data-title);
    display: none;
    font-size: 12rem;
    position: absolute;
    right: -${space[3]};
    z-index: -1;
    color: ${colors.purple[5]};

    ${mediaQueries.md} {
      display: block;
    }
  }
`

const Icon = styled(`span`)`
  display: flex;
  align-items: center;
  margin-right: ${space[2]};

  svg {
    width: ${space[7]};
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
