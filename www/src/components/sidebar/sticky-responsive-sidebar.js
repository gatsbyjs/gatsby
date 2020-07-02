/** @jsx jsx */
import { jsx } from "theme-ui"
import { useState, Fragment } from "react"

import Sidebar from "./sidebar"
import ScrollSyncSidebar from "./scroll-sync-sidebar"
import ChevronSvg from "./chevron-svg"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

export default function StickyResponsiveSidebar(props) {
  const [isOpen, setIsOpen] = useState(false)

  const { enableScrollSync } = props
  const SidebarComponent = enableScrollSync ? ScrollSyncSidebar : Sidebar
  const iconOffset = isOpen ? 5 : -5
  const menuOpacity = isOpen ? 1 : 0

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
            top: t => `calc(${t.sizes.headerHeight} + ${t.sizes.bannerHeight})`,
            width: `sidebarWidth.default`,
          },
          [mediaQueries.lg]: {
            width: `sidebarWidth.large`,
          },
          opacity: menuOpacity,
          pointerEvents: isOpen ? `auto` : `none`,
        }}
      >
        <div
          sx={{
            boxShadow: `dialog`,
            height: `100%`,
            transform: isOpen
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
          <SidebarComponent closeSidebar={() => setIsOpen(false)} {...props} />
        </div>
      </div>
      <div
        sx={{
          backgroundColor: `gatsby`,
          borderRadius: `50%`,
          bottom: 11,
          boxShadow: `dialog`,
          cursor: `pointer`,
          display: `flex`,
          height: t => t.space[10],
          justifyContent: `space-around`,
          position: `fixed`,
          right: 6,
          visibility: `visible`,
          width: t => t.space[10],
          zIndex: `floatingActionButton`,
          [mediaQueries.md]: { display: `none` },
        }}
        onClick={() => setIsOpen(isOpen => !isOpen)}
        role="button"
        aria-label="Show Secondary Navigation"
        aria-controls="SecondaryNavigation"
        aria-expanded={isOpen ? `true` : `false`}
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
              transform: `translate(${5 - iconOffset}px, -5px) rotate(270deg)`,
              transition: t =>
                `transform ${t.transition.speed.default} ${t.transition.curve.default}`,
            }}
          />
        </div>
      </div>
    </Fragment>
  )
}
