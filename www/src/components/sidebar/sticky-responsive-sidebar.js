/** @jsx jsx */
import { jsx } from "theme-ui"
import { Component, Fragment } from "react"
import { withI18n } from "@lingui/react"
import { t } from "@lingui/macro"

import Sidebar from "./sidebar"
import ScrollSyncSidebar from "./scroll-sync-sidebar"
import ChevronSvg from "./chevron-svg"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

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
    const { i18n, enableScrollSync } = this.props
    const SidebarComponent = enableScrollSync ? ScrollSyncSidebar : Sidebar

    const iconOffset = open ? 5 : -5
    const menuOpacity = open ? 1 : 0

    return (
      <Fragment>
        <div
          sx={{
            border: 0,
            bottom: 0,
            display: `block`,
            height: `100vh`,
            position: `fixed`,
            top: 0,
            transition: t =>
              `opacity ${t.transition.speed.default} ${t.transition.curve.default}`,
            width: `sidebarWidth.mobile`,
            zIndex: `sidebar`,
            [mediaQueries.md]: {
              height: t =>
                `calc(100vh - ${t.sizes.headerHeight} - ${t.sizes.bannerHeight})`,
              maxWidth: `none`,
              opacity: `1 !important`,
              pointerEvents: `auto`,
              top: t =>
                `calc(${t.sizes.headerHeight} + ${t.sizes.bannerHeight})`,
              width: `sidebarWidth.default`,
            },
            [mediaQueries.lg]: {
              width: `sidebarWidth.large`,
            },
            opacity: menuOpacity,
            pointerEvents: open ? `auto` : `none`,
          }}
        >
          <div
            sx={{
              boxShadow: `dialog`,
              height: `100%`,
              transform: open
                ? `translateX(0)`
                : t => `translateX(-${t.sizes.sidebarWidth.mobile})`,
              transition: t =>
                `transform ${t.transition.speed.default} ${t.transition.curve.default}`,
              [mediaQueries.md]: {
                boxShadow: `none`,
                transform: `none !important`,
              },
            }}
          >
            <SidebarComponent
              closeSidebar={this._closeSidebar}
              {...this.props}
            />
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
          aria-label={i18n._(t`Show Secondary Navigation`)}
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
              size={16}
              cssProps={{
                transform: `translate(${iconOffset}px, 5px) rotate(90deg)`,
                transition: t =>
                  `transform ${t.transition.speed.default} ${t.transition.curve.default}`,
              }}
            />
            <ChevronSvg
              size={16}
              cssProps={{
                transform: `translate(${
                  5 - iconOffset
                }px, -5px) rotate(270deg)`,
                transition: t =>
                  `transform ${t.transition.speed.default} ${t.transition.curve.default}`,
              }}
            />
          </div>
        </div>
      </Fragment>
    )
  }
}

export default withI18n()(StickyResponsiveSidebar)
