import React from "react"
import PropTypes from "prop-types"
import { css } from "react-emotion"
import facepaint from "facepaint"

import presets, { colors } from "../../utils/presets"
import { rhythm, options, scale } from "../../utils/typography"

const PageHeading = ({ title, icon }) => (
  <header className={pageHeading}>
    <h1>
      <span dangerouslySetInnerHTML={{ __html: icon }} />
      {title}
    </h1>
  </header>
)

PageHeading.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.string,
}

export default PageHeading

/* STYLES */

const {
  breakpoints: { tablet, desktop },
  bannerHeight,
  headerHeight,
  pageHeadingDesktopWidth,
} = presets

const breakpoints = [tablet]
const mq = facepaint(breakpoints.map(bp => `@media (min-width: ${bp}px)`))

const pageHeading = css`
  ${mq({
    left: ["auto", 0],
    position: ["relative", "fixed"],
    padding: [`${rhythm(options.blockMarginBottom)}`, 0],
    top: ["auto", `calc(${bannerHeight} + ${headerHeight})`],
  })};

  & h1 {
    align-items: center;
    color: ${colors.lilac};
    display: flex;
    font-size: 1.5rem;
    margin: 0;
    position: relative;
    width: 100%;

    ${mq({
      transform: ["", "rotate(-90deg) translate(calc(-100% - 2rem), 0.7rem)"],
      transformOrigin: ["", "top left"],
    })};

    span {
      display: block;
      width: 36px;
      height: 32px;
      margin: 0.1rem 0.1rem 0 -0.3rem;
    }

    &::after {
      bottom: 2rem;
      content: "Ecosystem";
      font-size: 12rem;
      opacity: 0.03;
      position: absolute;
      right: -0.7rem;
      z-index: -1;

      ${mq({
        display: ["none", "block"],
      })};
    }
  }

  & svg {
    fill: transparent;

    & .svg-stroke {
      stroke-miterlimit: 10;
      stroke-width: 1.4173;
    }
    & .svg-stroke-accent {
      stroke: ${colors.lavender};
    }
    & .svg-stroke-accent {
      stroke: ${colors.lavender};
    }
    & .svg-stroke-lilac {
      stroke: ${colors.lavender};
    }
    & .svg-fill-lilac {
      fill: ${colors.lavender};
    }
    & .svg-fill-gatsby {
      fill: ${colors.lavender};
    }
    & .svg-fill-brightest {
      fill: transparent;
    }
    & .svg-fill-accent {
      fill: ${colors.lavender};
    }
    & .svg-stroke-gatsby {
      stroke: ${colors.lavender};
    }
    & .svg-fill-gradient-accent-white-top {
      fill: transparent;
    }
    & .svg-fill-gradient-accent-white-45deg: {
      fill: transparent;
    }
    & .svg-fill-gradient-accent-white-bottom {
      fill: transparent;
    }
    & .svg-fill-gradient-purple {
      fill: ${colors.lavender};
    }
    & .svg-stroke-gradient-purple {
      stroke: ${colors.lavender};
    }
    & .svg-fill-wisteria {
      fill: transparent;
    }
  }
`

/*
      "& .svg-stroke-accent": { stroke: colors.lavender },
      "& .svg-stroke-lilac": { stroke: colors.lavender },
      "& .svg-fill-lilac": { fill: colors.lavender },
      "& .svg-fill-gatsby": { fill: colors.lavender },
      "& .svg-fill-brightest": { fill: `#fff` },
      "& .svg-fill-accent": { fill: colors.lavender },
      "& .svg-stroke-gatsby": { stroke: colors.lavender },
      "& .svg-fill-gradient-accent-white-top": { fill: `transparent` },
      "& .svg-fill-gradient-accent-white-45deg": { fill: `transparent` },
      "& .svg-fill-gradient-accent-white-bottom": { fill: `#fff` },
      "& .svg-fill-gradient-purple": { fill: colors.lavender },
      "& .svg-stroke-gradient-purple": { stroke: colors.lavender },
      "& .svg-fill-wisteria": { fill: `transparent` },
      "&:hover": { ...svgActive },
*/
