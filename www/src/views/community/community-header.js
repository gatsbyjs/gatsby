import React, { Component } from "react"
import { Link } from "gatsby"
import { rhythm, scale } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"

class CommunityHeader extends Component {
  render() {
    return (
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
            border: `1px solid ${colors.gatsby}`,
          }}
        >
          navigation
        </nav>
      </header>
    )
  }
}

export default CommunityHeader
