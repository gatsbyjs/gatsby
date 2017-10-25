import React from "react"
import Link from "gatsby-link"

import { rhythm, scale, options } from "../utils/typography"

const Navigation = () => (
  <div css={{ display: `flex`, alignItems: `baseline` }}>
    <h1 css={{ marginBottom: 0 }}>
      <Link
        to="/"
        css={{
          backgroundImage: `none`,
          color: options.accentColor,
        }}
      >
        Gatsby Image
      </Link>
    </h1>
    <nav
      css={{
        ...scale(-4 / 5),
        fontFamily: options.headerFontFamily.join(`,`),
        textTransform: `uppercase`,
        margin: 0,
        marginLeft: `auto`,
        "& a": {
          color: options.accentColor,
          opacity: 0.7,
          backgroundImage: `none`,
        },
        "& .nav-link-active": {
          color: options.accentColor,
          opacity: 1,
        },
      }}
    >
      <Link
        to="/blur-up/"
        activeClassName="nav-link-active"
        css={{ marginLeft: `auto`, marginRight: `.5rem` }}
      >
        Blur Up
      </Link>
      <Link
        to="background-color/"
        css={{ marginRight: `.5rem` }}
        activeClassName="nav-link-active"
      >
        Background Color
      </Link>
      <Link to="traced-svg/" activeClassName="nav-link-active">
        Traced SVG
      </Link>
    </nav>
  </div>
)

export default Navigation
