import React from "react"
import Link from "gatsby-link"

import { rhythm, scale, options } from "../utils/typography"

const Navigation = () => (
  <div>
    <h1 css={{ marginBottom: options.blockMarginBottom }}>
      <Link
        to="/"
        css={{
          ...scale(3 / 4),
          backgroundImage: `none`,
          color: options.accentColor,
        }}
      >
        Gatsby Image
      </Link>
    </h1>
    <nav
      css={{
        fontFamily: options.headerFontFamily.join(`,`),
        "& a": {
          color: options.bodyColor,
          opacity: 0.7,
          textTransform: `uppercase`,
          backgroundImage: `none`,
          fontWeight: `300`,
          transition: `all 200ms ease-out`,
          letterSpacing: `.005em`,
        },
        "& a:after": {
          content: ` / `,
          color: options.bodyColor,
          opacity: 0.2,
          padding: `0 ${rhythm(options.blockMarginBottom / 4)}`,
        },
        "& a:last-child:after": {
          display: `none`,
        },
        "& .nav-link-active, & a:hover": {
          color: options.accentColor,
          opacity: 1,
        },
      }}
    >
      <Link to="/blur-up/" activeClassName="nav-link-active">
        Blur Up
      </Link>
      <Link to="/background-color/" activeClassName="nav-link-active">
        Background Color
      </Link>
      <Link to="/traced-svg/" activeClassName="nav-link-active">
        Traced SVG
      </Link>
      <Link to="/prefer-webp/" activeClassName="nav-link-active">
        Prefer WebP
      </Link>
    </nav>
  </div>
)

export default Navigation
