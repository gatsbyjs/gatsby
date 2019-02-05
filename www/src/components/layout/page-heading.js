import React from "react"
import PropTypes from "prop-types"
import styled from "react-emotion"

import presets, { colors } from "../../utils/presets"
import { rhythm, options } from "../../utils/typography"

const PageHeadingContainer = styled(`header`)`
  padding: ${rhythm(options.blockMarginBottom)};

  ${presets.Tablet} {
    left: 0;
    position: fixed;
    padding: 0;
    top: ${`calc(${presets.bannerHeight} + ${presets.headerHeight})`};
  }
`

const H1 = styled(`h1`)`
  align-items: center;
  color: ${colors.lilac};
  display: flex;
  font-size: 1.5rem;
  margin: 0;
  position: relative;
  width: 100%;

  ${presets.Tablet} {
    transform: rotate(-90deg) translate(calc(-100% - 2rem), 0.7rem);
    transform-origin: top left;
  }

  :after {
    bottom: 2rem;
    content: attr(data-title);
    display: none;
    font-size: 12rem;
    opacity: 0.03;
    position: absolute;
    right: -0.7rem;
    z-index: -1;

    ${presets.Tablet} {
      display: block;
    }
  }
`

const Icon = styled(`span`)`
  display: block;
  width: 36px;
  height: 32px;
  margin: 0.1rem 0.1rem 0 -0.3rem;

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
    fill: #fff;
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
    fill: #fff;
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
