import React, { Component } from "react"
import FaAngleDown from "react-icons/lib/fa/angle-down"
import FaAngleUp from "react-icons/lib/fa/angle-up"

import { options, scale, rhythm } from "../../utils/typography"
import { colors } from "../../utils/presets"

import styles from "./styles"

class Collapsible extends Component {
  state = {
    collapsed: false,
  }

  handleClick = () => {
    this.setState({ collapsed: !this.state.collapsed })
  }

  render() {
    const { heading, children } = this.props
    const { collapsed } = this.state

    return (
      <div
        css={{
          borderBottom: collapsed ? 0 : `1px solid ${colors.ui.light}`,
          display: collapsed ? false : `flex`,
          flex: collapsed ? `0 0 auto` : `1 1 auto`,
          overflowY: `auto`,
          // paddingBottom: collapsed ? 0 : rhythm(options.blockMarginBottom),
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
              fontSize: scale(-2 / 5).fontSize,
              marginTop: rhythm(options.blockMarginBottom),
              marginRight: rhythm(5 / 4),
              letterSpacing: `.1em`,
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
              ...styles.scrollbar,
              display: collapsed ? `none` : `block`,
              overflowY: `auto`,

              /**
               * Dynamic shadow indicating there is more content to scroll
               * Adapted from http://lea.verou.me/2012/04/background-attachment-local/
               * It isn’t ideal because the shadows sit below the content (see: background)
               * instead of above
               * But this has got to be more performant and maintainable
               * than using React ref + listening to scroll event
               */
              background: `
              linear-gradient(white 30%, rgba(255,255,255,0)),
              linear-gradient(rgba(255,255,255,0), white 70%) 0 100%,
              radial-gradient(farthest-side at 50% 0, ${
                colors.ui.bright
              }, transparent),
              radial-gradient(farthest-side at 50% 100%, ${
                colors.ui.bright
              }, transparent) 0 100%`,
              backgroundRepeat: `no-repeat`,
              backgroundSize: `100% 60px, 100% 60px, 100% 20px, 100% 20px`,
              backgroundAttachment: `local, local, scroll, scroll`,
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
