import React from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"

import {
  colors,
  space,
  breakpoints,
  sizes,
  lineHeights,
  fontSizes,
} from "../../utils/presets"

const PageHeadingContainer = styled(`header`)`
  padding: ${space[6]};

  ${breakpoints.md} {
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

  ${breakpoints.md} {
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
    color: ${colors.ui.whisper};

    ${breakpoints.md} {
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

  .svg-stroke {
    stroke-miterlimit: 10;
    stroke-width: 1.4173;
  }

  .svg-stroke-accent {
    stroke: ${colors.lavender};
  }
  .svg-stroke-lilac {
    stroke: ${colors.lavender};
  }
  .svg-fill-lilac {
    fill: ${colors.lavender};
  }
  .svg-fill-gatsby {
    fill: ${colors.lavender};
  }
  .svg-fill-brightest {
    fill: ${colors.white};
  }
  .svg-fill-accent {
    fill: ${colors.lavender};
  }
  .svg-stroke-gatsby {
    stroke: ${colors.lavender};
  }
  .svg-fill-gradient-accent-white-top {
    fill: transparent;
  }
  .svg-fill-gradient-accent-white-45deg {
    fill: transparent;
  }
  .svg-fill-gradient-accent-white-bottom: {
    fill: ${colors.white};
  }
  .svg-fill-gradient-purple {
    fill: ${colors.lavender};
  }
  .svg-stroke-gradient-purple {
    stroke: ${colors.lavender};
  }
  .svg-fill-wisteria {
    fill: transparent;
  }
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
