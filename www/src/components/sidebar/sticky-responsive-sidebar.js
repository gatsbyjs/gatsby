/** @jsx jsx */
import { jsx } from "theme-ui"
import React, { Component } from "react"

import Sidebar from "./sidebar"
import ScrollSyncSidebar from "./scroll-sync-sidebar"
import ChevronSvg from "./chevron-svg"
import { transition, mediaQueries } from "../../gatsby-plugin-theme-ui"
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
          sx={{
            border: 0,
            bottom: 0,
            display: `block`,
            height: `100vh`,
            position: `fixed`,
            top: 0,
            transition: t =>
              `opacity ${t.transition.speed.slow} ${
                t.transition.curve.default
              }`,
            width: 320,
            zIndex: `sidebar`,
            [mediaQueries.md]: {
              height: t =>
                `calc(100vh - ${t.sizes.headerHeight} - ${
                  t.sizes.bannerHeight
                })`,
              maxWidth: `none`,
              opacity: `1 !important`,
              pointerEvents: `auto`,
              top: t =>
                `calc(${t.sizes.headerHeight} + ${t.sizes.bannerHeight})`,
              width: t => rhythm(t.sizes.sidebarWidth.default),
            },
            [mediaQueries.lg]: {
              width: t => rhythm(t.sizes.sidebarWidth.large),
            },
            opacity: menuOpacity,
            pointerEvents: open ? `auto` : `none`,
          }}
        >
          <div
            sx={{
              boxShadow: `dialog`,
              height: `100%`,
              transform: `translateX(-${menuOffset})`,
              transition: t =>
                `transform ${t.transition.speed.slow} ${
                  t.transition.curve.default
                }`,
              [mediaQueries.md]: {
                boxShadow: `none`,
                transform: `none !important`,
              },
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
          sx={{
            backgroundColor: `gatsby`,
            borderRadius: `50%`,
            bottom: t => t.space[11],
            boxShadow: `dialog`,
            cursor: `pointer`,
            display: `flex`,
            height: t => t.space[10],
            justifyContent: `space-around`,
            position: `fixed`,
            right: t => t.space[6],
            visibility: `visible`,
            width: t => t.space[10],
            zIndex: `floatingActionButton`,
            [mediaQueries.md]: { display: `none` },
          }}
          onClick={this._openSidebar}
          role="button"
          aria-label="Show Secondary Navigation"
          aria-controls="SecondaryNavigation"
          aria-expanded={open ? `true` : `false`}
          tabIndex={0}
        >
          <div
            sx={{
              alignSelf: `center`,
              color: `white`,
              display: `flex`,
              flexDirection: `column`,
              height: t => t.space[5],
              visibility: `visible`,
              width: t => t.space[5],
            }}
          >
            <ChevronSvg
              size={15}
              cssProps={{
                transform: `translate(${iconOffset}px, 5px) rotate(90deg)`,
                transition: `transform ${transition.speed.fast} ${
                  transition.curve.default
                }`,
              }}
            />
            <ChevronSvg
              size={15}
              cssProps={{
                transform: `translate(${5 -
                  iconOffset}px, -5px) rotate(270deg)`,
                transition: `transform ${transition.speed.fast} ${
                  transition.curve.default
                }`,
              }}
            />
          </div>
        </div>
      </ScrollPositionProvider>
    )
  }
}

export default StickyResponsiveSidebar
