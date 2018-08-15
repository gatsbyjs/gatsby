import React, { Component } from "react"
import { Link } from "gatsby"
import { rhythm, scale } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"

const CommunityHeaderLink = ({ linkTo, children }) => (
  <li
    css={{
      display: `flex`,
      alignItems: `center`,
      margin: 0,
    }}
  >
    <Link
      to={linkTo}
      css={{
        "&&": {
          textTransform: `uppercase`,
          ...scale(-1 / 4),
          fontWeight: `600`,
          boxShadow: `none`,
          borderBottom: `none`,
          padding: `6px 1.5rem`,
          borderRadius: `40px`,
          "&:hover": {
            backgroundColor: colors.gatsby,
            color: `white`,
          },
        },
      }}
    >
      {children}
    </Link>
  </li>
)
const CommunityHeader = () => (
  <header
    css={{
      display: `flex`,
      alignItems: `center`,
      width: `100vw`,
      borderBottom: `1px solid ${colors.ui.light}`,
      backgroundColor: `rgba(255,255,255,0.975)`,
      height: presets.headerHeight,
      zIndex: `2`,
      paddingLeft: rhythm(3 / 4),
      paddingRight: rhythm(3 / 4),
    }}
  >
    <Link
      to="/community/"
      css={{
        "&&": {
          ...scale(1 / 3),
          color: colors.gatsby,
          boxShadow: `none`,
          borderBottom: `none`,
          marginRight: rhythm(1 / 2),
        },
      }}
    >
      Creators
    </Link>
    <nav
      css={{
        // listStyle: `none`,
        display: `flex`,
        justifyContent: `space-around`,
        alignItems: `center`,
      }}
    >
      <CommunityHeaderLink linkTo="/community">All</CommunityHeaderLink>
      <CommunityHeaderLink linkTo="/community/people">
        People
      </CommunityHeaderLink>
      <CommunityHeaderLink linkTo="/community/agencies">
        Agencies
      </CommunityHeaderLink>
      <CommunityHeaderLink linkTo="/community/companies">
        Companies
      </CommunityHeaderLink>
    </nav>
  </header>
)

export default CommunityHeader
