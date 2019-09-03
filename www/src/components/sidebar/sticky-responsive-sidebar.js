import React, { Component } from "react"

import Sidebar from "./sidebar"
import ScrollSyncSidebar from "./scroll-sync-sidebar"
import ChevronSvg from "./chevron-svg"
import {
  colors,
  transition,
  shadows,
  space,
  mediaQueries,
  sizes,
  zIndices,
} from "../../utils/presets"
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

    const iconOffset = open ? 5 : -5
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
          aria-label="Show Secondary Navigation"
          aria-controls="SecondaryNavigation"
          aria-expanded={open ? `true` : `false`}
          tabIndex={0}
        >
          <div css={{ ...styles.sidebarToggleButtonInner }}>
            <ChevronSvg
              size={15}
              cssProps={{
                transform: `translate(${iconOffset}px, 5px) rotate(90deg)`,
                transition: `transform ${transition.speed.fast} ${transition.curve.default}`,
              }}
            />
            <ChevronSvg
              size={15}
              cssProps={{
                transform: `translate(${5 -
                  iconOffset}px, -5px) rotate(270deg)`,
                transition: `transform ${transition.speed.fast} ${transition.curve.default}`,
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
    transition: `opacity ${transition.speed.slow} ${transition.curve.default}`,
    width: 320,
    zIndex: zIndices.sidebar,
    [mediaQueries.md]: {
      height: `calc(100vh - ${sizes.headerHeight} - ${sizes.bannerHeight})`,
      maxWidth: `none`,
      opacity: `1 !important`,
      pointerEvents: `auto`,
      top: `calc(${sizes.headerHeight} + ${sizes.bannerHeight})`,
      width: rhythm(sizes.sidebarWidth.default),
    },
    [mediaQueries.lg]: {
      width: rhythm(sizes.sidebarWidth.large),
    },
  },
  sidebar: {
    height: `100%`,
    transition: `transform ${transition.speed.slow} ${transition.curve.default}`,
    boxShadow: shadows.dialog,
    [mediaQueries.md]: {
      transform: `none !important`,
      boxShadow: `none`,
    },
  },
  sidebarToggleButton: {
    backgroundColor: colors.gatsby,
    borderRadius: `50%`,
    bottom: space[11],
    boxShadow: shadows.dialog,
    cursor: `pointer`,
    display: `flex`,
    height: space[10],
    justifyContent: `space-around`,
    position: `fixed`,
    right: space[6],
    visibility: `visible`,
    width: space[10],
    zIndex: zIndices.floatingActionButton,
    [mediaQueries.md]: { display: `none` },
  },
  sidebarToggleButtonInner: {
    alignSelf: `center`,
    color: colors.white,
    display: `flex`,
    flexDirection: `column`,
    height: space[5],
    visibility: `visible`,
    width: space[5],
  },
}
