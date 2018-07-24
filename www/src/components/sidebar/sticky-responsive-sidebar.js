import React, { Component } from "react"

import ScrollSyncBody from "./scroll-sync-body"
import SidebarBody from "./sidebar"
import ChevronSvg from "./chevron-svg"
import presets, { colors } from "../../utils/presets"
import { rhythm } from "../../utils/typography"

class StickyResponsiveSidebar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      open: false,
    }
  }

  _openNavMenu = () => {
    this.setState({ open: !this.state.open })
  }

  _closeNavMenu = () => {
    this.setState({ open: false })
  }

  render() {
    const { open } = this.state
    const BodyComponent = this.props.enableScrollSync
      ? ScrollSyncBody
      : SidebarBody

    const iconOffset = open ? 8 : -4
    const menuOpacity = open ? 1 : 0
    const menuOffset = open ? 0 : rhythm(10)

    return (
      <React.Fragment>
        <div
          css={{
            ...styles.sidebar,
            opacity: menuOpacity,
            pointerEvents: open ? `auto` : `none`,
            "&:hover": {
              visibility: `visible`,
            },
          }}
        >
          <div css={{ ...styles.sidebarInner }} className="inner">
            <div
              css={{
                transform: `translateX(-${menuOffset})`,
                transition: `transform 0.5s ease`,
                [presets.Tablet]: {
                  transform: `none !important`,
                },
              }}
            >
              <BodyComponent
                closeParentMenu={this._closeNavMenu}
                {...this.props}
              />
            </div>
          </div>
        </div>
        <div
          css={{ ...styles.button }}
          onClick={this._openNavMenu}
          role="button"
          tabIndex={0}
        >
          <div css={{ ...styles.buttonInner }}>
            <ChevronSvg
              size={15}
              cssProps={{
                transform: `translate(2px, ${iconOffset}px) rotate(180deg)`,
                transition: `transform 0.2s ease`,
              }}
            />
            <ChevronSvg
              size={15}
              cssProps={{
                transform: `translate(2px, ${0 - iconOffset}px)`,
                transition: `transform 0.2s ease`,
              }}
            />
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default StickyResponsiveSidebar

const styles = {
  sidebar: {
    background: `#fff`,
    border: 0,
    boxShadow: `0 0 20px rgba(0, 0, 0, 0.15)`,
    display: `block`,
    height: `100vh`,
    position: `fixed`,
    overflowY: `auto`,
    top: 0,
    bottom: 0,
    transition: `opacity 0.5s ease`,
    WebkitOverflowScrolling: `touch`,
    width: 320,
    zIndex: 10,
    visibility: `hidden`,
    "::-webkit-scrollbar": {
      width: `6px`,
      height: `6px`,
    },
    "::-webkit-scrollbar-thumb": {
      background: colors.ui.bright,
    },
    "::-webkit-scrollbar-track": {
      background: colors.ui.light,
    },
    [presets.Tablet]: {
      boxShadow: `none`,
      height: `calc(100vh - ${presets.headerHeight} - ${
        presets.bannerHeight
      } + 1px)`,
      maxWidth: `none`,
      opacity: `1 !important`,
      pointerEvents: `auto`,
      top: `calc(${presets.headerHeight} + ${presets.bannerHeight} - 1px)`,
      width: rhythm(10),
      zIndex: 2,
      "::-webkit-scrollbar-track": {
        background: `transparent`,
      },
    },
    [presets.Desktop]: {
      width: rhythm(12),
    },
  },
  sidebarInner: {
    backgroundColor: colors.ui.whisper,
    visibility: `visible`,
    height: `100%`,
    position: `relative`,
    "&:before": {
      content: ` `,
      width: 1,
      background: colors.ui.border,
      position: `absolute`,
      display: `block`,
      right: 0,
      left: `auto`,
      top: 0,
      height: `100%`,
      bottom: 0,
    },
  },
  button: {
    backgroundColor: colors.gatsby,
    bottom: 64,
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    borderRadius: `50%`,
    boxShadow: `0 0 20px rgba(0, 0, 0, 0.3)`,
    cursor: `pointer`,
    display: `flex`,
    height: 60,
    justifyContent: `space-around`,
    position: `fixed`,
    right: 20,
    visibility: `visible`,
    width: 60,
    zIndex: 20,
    [presets.Tablet]: { display: `none` },
  },
  buttonInner: {
    alignSelf: `center`,
    color: `#fff`,
    display: `flex`,
    flexDirection: `column`,
    height: 20,
    width: 20,
    visibility: `visible`,
  },
}
