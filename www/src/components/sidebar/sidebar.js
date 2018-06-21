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
    const { sidebarStyles, enableScrollSync } = this.props
    const BodyComponent = enableScrollSync ? ScrollSyncBody : SidebarBody

    const iconOffset = open ? 8 : -4
    const menuOpacity = open ? 1 : 0
    const menuOffset = open ? 0 : rhythm(10)

    return (
      <React.Fragment>
        <div
          style={{
            opacity: menuOpacity,
            transition: `opacity 0.5s ease`,
          }}
          css={{
            ...sidebarStyles,
            top: 0,
            height: `100vh`,
            display: `block`,
            zIndex: 10,
            pointerEvents: open ? `auto` : `none`,
            boxShadow: `0 0 20px rgba(0, 0, 0, 0.15)`,
            border: 0,
            width: 320,
            background: `#fff`,
            [presets.Tablet]: {
              opacity: `1 !important`,
              top: `calc(${presets.headerHeight})`,
              height: `calc(100vh - ${presets.headerHeight})`,
              zIndex: 2,
              pointerEvents: `auto`,
              boxShadow: `none`,
              borderRight: `1px solid ${colors.ui.light}`,
              width: rhythm(10),
              maxWidth: `none`,
              backgroundColor: colors.ui.whisper,
            },
            [presets.Desktop]: {
              width: rhythm(12),
            },
            [presets.Hd]: {
              width: rhythm(14),
            },
            "&&": {
              padding: `0`,
              paddingTop: `${rhythm(3 / 4)}`,
              paddingBottom: `${rhythm(3 / 4)}`,
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
