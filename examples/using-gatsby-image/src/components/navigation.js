import React from "react"
import Link from "gatsby-link"

import { rhythm, scale, options } from "../utils/typography"

const Navigation = () => (
  <div>
    <h1
      css={{
        marginBottom: 0,
      }}
    >
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
    <ul
      css={{
        fontFamily: options.headerFontFamily.join(`,`),
        margin: 0,
        listStyle: `none`,
        "& li": {
          display: `inline`,
          fontWeight: `300`,
        },
        "& li:after": {
          content: ` / `,
          color: options.bodyColor,
          opacity: 0.2,
          padding: `0 ${rhythm(options.blockMarginBottom / 4)}`,
        },
        "& li:last-child:after": {
          display: `none`,
        },
        "& a": {
          color: options.bodyColor,
          opacity: 0.57,
          textTransform: `uppercase`,
          backgroundImage: `none`,
          transition: `all 200ms ease-out`,
          letterSpacing: `.005em`,
        },
        "& .nav-link-active, & a:hover": {
          color: options.accentColor,
          opacity: 1,
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0) 1px, ${options.accentColor} 1px, ${options.accentColor} 2px, rgba(0, 0, 0, 0) 2px);`,
        },
        "& .nav-link-active": {
          // fontWeight: `700`,
        },
      }}
    >
      <li>
        <Link to="/blur-up/" activeClassName="nav-link-active">
          Blur Up
        </Link>
      </li>
      <li>
        <Link to="/background-color/" activeClassName="nav-link-active">
          Background Color
        </Link>
      </li>
      <li>
        <Link to="/traced-svg/" activeClassName="nav-link-active">
          Traced SVG
        </Link>
      </li>
      <li>
        <Link to="/prefer-webp/" activeClassName="nav-link-active">
          Prefer WebP
        </Link>
      </li>
    </ul>
  </div>
)

export default Navigation
