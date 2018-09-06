import React, { Component } from "react"

import Sidebar from "./sidebar"
import ScrollSyncSidebar from "./scroll-sync-sidebar"
import ChevronSvg from "./chevron-svg"
import presets, { colors } from "../../utils/presets"
import { rhythm } from "../../utils/typography"
import ScrollPositionProvider, {
  ScrollPositionConsumer,
} from "./scrollbar-position-provider"

class StickyResponsiveSidebar extends Component {
  constructor(props) {
    super(props)

    this.state = { open: false }
  }

  _openSidebar = () => {
    this.setState({ open: !this.state.open })
  }

  _closeSidebar = () => {
    this.setState({ open: false })
  }

  render() {
    const { open } = this.state
    const {
      enableScrollSync,
      location: { pathname },
    } = this.props
    const SidebarComponent = enableScrollSync ? ScrollSyncSidebar : Sidebar

    const iconOffset = open ? 8 : -4
    const menuOpacity = open ? 1 : 0
    const menuOffset = open ? 0 : rhythm(10)

    const sidebarType = pathname.split(`/`)[1]

    return (
      <ScrollPositionProvider>
        <div
          css={{
            ...styles.sidebarScrollContainer,
            opacity: menuOpacity,
            pointerEvents: open ? `auto` : `none`,
          }}
        >
          <div
            css={{
              ...styles.sidebar,
              transform: `translateX(-${menuOffset})`,
            }}
          >
            <ScrollPositionConsumer>
              {({ positions, onPositionChange }) => (
                <SidebarComponent
                  position={positions[sidebarType]}
                  onPositionChange={onPositionChange}
                  closeSidebar={this._closeSidebar}
                  {...this.props}
                />
              )}
            </ScrollPositionConsumer>
          </div>
        </div>
        <div
          css={{ ...styles.sidebarToggleButton }}
          onClick={this._openSidebar}
          role="button"
          tabIndex={0}
        >
          <div css={{ ...styles.sidebarToggleButtonInner }}>
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
      </ScrollPositionProvider>
    )
  }
}

export default StickyResponsiveSidebar

const styles = {
  sidebarScrollContainer: {
    border: 0,
    bottom: 0,
    display: `block`,
    height: `100vh`,
    position: `fixed`,
    top: 0,
    transition: `opacity 0.5s ease`,
    width: 320,
    zIndex: 10,
    [presets.Tablet]: {
      height: `calc(100vh - ${presets.headerHeight} - ${
        presets.bannerHeight
      } + 1px)`,
      maxWidth: `none`,
      opacity: `1 !important`,
      pointerEvents: `auto`,
      top: `calc(${presets.headerHeight} + ${presets.bannerHeight} - 1px)`,
      width: rhythm(10),
    },
    [presets.Desktop]: {
      width: rhythm(12),
    },
  },
  sidebar: {
    height: `100%`,
    transition: `transform 0.5s ease`,
    boxShadow: `0 0 20px rgba(0, 0, 0, 0.15)`,
    [presets.Tablet]: {
      transform: `none !important`,
      boxShadow: `none`,
    },
  },
  sidebarToggleButton: {
    backgroundColor: colors.gatsby,
    borderRadius: `50%`,
    bottom: 64,
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
  sidebarToggleButtonInner: {
    alignSelf: `center`,
    color: `#fff`,
    display: `flex`,
    flexDirection: `column`,
    height: 20,
    visibility: `visible`,
    width: 20,
  },
}
