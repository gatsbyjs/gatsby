/** @jsx jsx */
import { jsx } from "theme-ui"
import { Component } from "react"
import { FaAngleDown, FaAngleUp } from "react-icons/fa"

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
        sx={{
          borderBottom: t =>
            collapsed ? 0 : `1px solid ${t.colors.ui.border}`,
          display: collapsed ? false : `flex`,
          flex: collapsed ? `0 0 auto` : `1 1 auto`,
          minHeight: fixed ? `${fixed}px` : `initial`,
          maxHeight: fixed ? `${fixed}px` : `initial`,
          flexBasis: 0,
          overflowY: collapsed ? false : `auto`,
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
          <button
            sx={{
              alignItems: `center`,
              color: `textMuted`,
              cursor: `pointer`,
              display: `flex`,
              flexShrink: 0,
              fontWeight: `body`,
              fontSize: 1,
              my: 6,
              mr: 4,
              p: 0,
              letterSpacing: `tracked`,
              textTransform: `uppercase`,
              background: `none`,
              border: `none`,
              "&:hover": {
                color: `gatsby`,
              },
            }}
            aria-expanded={!collapsed}
            onClick={this.handleClick}
          >
            {heading}
            {` `}
            <span sx={{ ml: `auto` }} css={{ display: `flex` }}>
              {collapsed ? <FaAngleDown /> : <FaAngleUp />}
            </span>
          </button>
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
