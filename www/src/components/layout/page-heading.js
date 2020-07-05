/** @jsx jsx */
import { jsx } from "theme-ui"
import PropTypes from "prop-types"

import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"
import { svgStyles } from "../../utils/styles"

const headerStyles = {
  p: [6, null, 0],
  [mediaQueries.md]: {
    left: 0,
    position: `fixed`,
    top: t => `calc(${t.sizes.bannerHeight} + ${t.sizes.headerHeight})`,
  },
}

const headingStyles = {
  alignItems: `center`,
  fontWeight: `bold`,
  color: `heading`,
  display: `flex`,
  fontSize: 4,
  lineHeight: `solid`,
  position: `relative`,
  width: `100%`,
  m: 0,
  [mediaQueries.md]: {
    transform: `rotate(-90deg) translate(calc(-100% - 2rem), 1rem)`,
    transformOrigin: `left top`,
  },

  ":after": {
    right: -3,
    bottom: -4,
    content: `attr(data-title)`,
    display: [`none`, null, `block`],
    fontSize: `12rem`,
    position: `absolute`,
    zIndex: `-1`,
    color: `blackFade.10`,
  },
}

const strokeSvgStyles = svgStyles().stroke
const defaultSvgStyles = svgStyles().default

const iconStyles = {
  display: `flex`,
  alignItems: `center`,
  mr: 2,
  svg: {
    width: `2rem`,
    height: `auto`,
    m: 0,
  },
  defaultSvgStyles,
  strokeSvgStyles,
}

export default function PageHeading({ title, icon }) {
  return (
    <header sx={headerStyles}>
      <h1 sx={headingStyles} data-title={title}>
        <span sx={iconStyles}>{icon}</span>
        {title}
      </h1>
    </header>
  )
}

PageHeading.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.element,
}
