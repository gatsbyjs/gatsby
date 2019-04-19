import React, { Component } from "react"
import FaAngleDown from "react-icons/lib/fa/angle-down"
import FaAngleUp from "react-icons/lib/fa/angle-up"

import { rhythm } from "../../utils/typography"
import { colors, space, fontSizes, letterSpacings } from "../../utils/presets"

class Collapsible extends Component {
  state = {
    collapsed: false,
  }

  handleClick = () => {
    this.setState({ collapsed: !this.state.collapsed })
  }

  render() {
    const { heading, fixed, children } = this.props
    const { collapsed } = this.state

    return (
      <div
        css={{
          borderBottom: collapsed ? 0 : `1px solid ${colors.ui.light}`,
          display: collapsed ? false : `flex`,
          flex: collapsed ? `0 0 auto` : `1 1 auto`,
          minHeight: fixed ? `${fixed}px` : `initial`,
          maxHeight: fixed ? `${fixed}px` : `initial`,
          flexBasis: 0,
          overflowY: `auto`,
          // paddingBottom: collapsed ? 0 : space[6],
        }}
      >
        <div
          css={{
            display: `flex`,
            flexDirection: `column`,
            minHeight: `100%`,
            width: `100%`,
          }}
        >
          <h4
            css={{
              alignItems: `center`,
              color: colors.lilac,
              cursor: `pointer`,
              display: `flex`,
              flexShrink: 0,
              fontWeight: `normal`,
              fontSize: fontSizes[1],
              marginTop: space[6],
              marginRight: rhythm(5 / 4),
              letterSpacing: letterSpacings.tracked,
              textTransform: `uppercase`,
              "&:hover": {
                color: colors.gatsby,
              },
            }}
            onClick={this.handleClick}
          >
            {heading}
            {` `}
            <span css={{ marginLeft: `auto` }}>
              {collapsed ? <FaAngleDown /> : <FaAngleUp />}
            </span>
          </h4>
          <div
            css={{
              display: collapsed ? `none` : `block`,
              overflowY: `auto`,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
}

export default Collapsible
