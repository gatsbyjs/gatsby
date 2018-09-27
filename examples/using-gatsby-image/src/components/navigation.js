import React from "react"
import { Link } from "gatsby"

import { rhythm, scale, options } from "../utils/typography"

const NavItem = ({ title, to }) => (
  <li
    css={{
      display: `inline`,
      fontFamily: options.headerFontFamily.join(`,`),
      fontWeight: `300`,
      "&:after": {
        color: options.bodyColor,
        content: ` / `,
        opacity: 0.2,
        padding: `0 ${rhythm(options.blockMarginBottom / 4)}`,
      },
      "&:last-child:after": {
        display: `none`,
      },
      // These are not directly applied to <Link> to avoid React Router's
      // <NavLink> from complaining about className not being a string
      // but an object
      // https://github.com/ReactTraining/react-router/issues/5593
      "& .nav-link": {
        backgroundImage: `none`,
        color: options.bodyColor,
        letterSpacing: `.005em`,
        opacity: 0.57,
        textTransform: `uppercase`,
        transition: `all 200ms ease-out`,
        whiteSpace: `nowrap`,
      },
      "& .nav-link-active, & .nav-link:hover": {
        backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0) 1px, ${
          options.accentColor
        } 1px, ${options.accentColor} 2px, rgba(0, 0, 0, 0) 2px)`,
        color: options.accentColor,
        opacity: 1,
      },
      "& .nav-link-active": {
        // fontWeight: `700`,
      },
    }}
  >
    <Link to={to} className="nav-link" activeClassName="nav-link-active">
      {title}
    </Link>
  </li>
)

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
        margin: 0,
        listStyle: `none`,
      }}
    >
      <NavItem to="/blur-up/" title="Blur Up" />
      <NavItem to="/background-color/" title="Background Color" />
      <NavItem to="/traced-svg/" title="Traced SVG" />
      <NavItem to="/prefer-webp/" title="Prefer WebP" />
    </ul>
  </div>
)

export default Navigation
