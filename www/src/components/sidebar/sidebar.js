import React, { Component } from "react"
import ScrollSyncBody from "./scroll-sync-body"
import SidebarBody from "./body"
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

    const horizontalPadding = rhythm(3 / 4)
    const horizonalPaddingDesktop = rhythm(3 / 2)

    return (
      <React.Fragment>
        <div
          style={{
            opacity: menuOpacity,
            transition: `opacity 0.5s ease`,
          }}
          css={{
            ...sidebarStyles,
            background: `#fff`,
            border: 0,
            boxShadow: `0 0 20px rgba(0, 0, 0, 0.15)`,
            display: `block`,
            height: `100vh`,
            paddingTop: horizontalPadding,
            paddingBottom: horizontalPadding,
            pointerEvents: open ? `auto` : `none`,
            top: 0,
            width: 320,
            zIndex: 10,
            [presets.Tablet]: {
              backgroundColor: colors.ui.whisper,
              borderRight: `1px solid ${colors.ui.light}`,
              boxShadow: `none`,
              height: `calc(100vh - ${presets.headerHeight} - ${
                presets.bannerHeight
              } + 1px)`,
              maxWidth: `none`,
              opacity: `1 !important`,
              pointerEvents: `auto`,
              top: `calc(${presets.headerHeight} + ${
                presets.bannerHeight
              } - 1px)`,
              width: rhythm(10),
              zIndex: 2,
            },
            [presets.Desktop]: {
              paddingTop: horizonalPaddingDesktop,
              paddingBottom: horizonalPaddingDesktop,
              width: rhythm(12),
            },
          }}
        >
          <div
            style={{
              transform: `translateX(-${menuOffset})`,
              transition: `transform 0.5s ease`,
            }}
            css={{
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
        <div
          css={{
            backgroundColor: colors.gatsby,
            bottom: 44, // iOS Safari's inert "bottom 44px"
            display: `block`, // gets overriden at small screen sizes
            cursor: `pointer`,
            position: `fixed`,
            right: 20,
            width: 60,
            zIndex: 20,
            borderRadius: `50%`,
            border: `1px solid rgba(255, 255, 255, 0.1)`,
            boxShadow: `0 0 20px rgba(0, 0, 0, 0.3)`,
            [presets.Tablet]: { display: `none` },
          }}
          onClick={this._openNavMenu}
          role="button"
          tabIndex={0}
        >
          <div
            css={{
              display: `flex`,
              flexDirection: `row`,
              alignItems: `center`,
              height: 60,
              width: `100%`,
              justifyContent: `space-around`,
            }}
          >
            <div
              css={{
                width: 20,
                height: 20,
                alignSelf: `center`,
                display: `flex`,
                flexDirection: `column`,
                color: `#fff`,
              }}
            >
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
        </div>
      </React.Fragment>
    )
  }
}

export default StickyResponsiveSidebar

const sidebarStyles = {
  width: rhythm(10),
  position: `fixed`,
  overflowY: `auto`,
  WebkitOverflowScrolling: `touch`,
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
}
