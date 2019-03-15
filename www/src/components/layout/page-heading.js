import React from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"

import presets, {
  colors,
  space,
  breakpoints,
  dimensions,
} from "../../utils/presets"
import { rhythm } from "../../utils/typography"

const PageHeadingContainer = styled(`header`)`
  padding: ${rhythm(space[6])};

  ${breakpoints.md} {
    left: 0;
    position: fixed;
    padding: 0;
    top: ${`calc(${dimensions.bannerHeight} + ${dimensions.headerHeight})`};
  }
`

const H1 = styled(`h1`)`
  align-items: center;
  color: ${colors.lilac};
  display: flex;
  font-size: ${presets.scale[5]};
  line-height: ${presets.lineHeights.solid};
  margin: 0;
  position: relative;
  width: 100%;

  ${breakpoints.md} {
    transform: rotate(-90deg)
      translate(calc(-100% - ${rhythm(space[7])}), ${rhythm(space[4])});
    transform-origin: top left;
  }

  :after {
    bottom: -${rhythm(space[4])};
    content: attr(data-title);
    display: none;
    font-size: 12rem;
    position: absolute;
    right: -${rhythm(space[3])};
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
  margin-right: ${rhythm(space[2])};

  svg {
    width: ${rhythm(space[7])};
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
