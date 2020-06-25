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

  return (
    <Fragment>
      <div
        aria-hidden={!isOpen}
        sx={{
          border: 0,
          bottom: 0,
          display: `block`,
          zIndex: `sidebar`,
          position: `fixed`,
          top: 0,
          height: `100vh`,
          left: isOpen ? 0 : t => `-${t.sizes.sidebarWidth.mobile}`,
          width: `sidebarWidth.mobile`,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? `auto` : `none`,
          transition: t => {
            const speedAndCurve = `${t.transition.speed.default} ${t.transition.curve.default}`

            return `opacity ${speedAndCurve}, left ${speedAndCurve}`
          },
          [mediaQueries.md]: {
            top: t => `calc(${t.sizes.headerHeight} + ${t.sizes.bannerHeight})`,
            height: t =>
              `calc(100vh - ${t.sizes.headerHeight} - ${t.sizes.bannerHeight})`,
            left: `initial`,
            width: `sidebarWidth.default`,
            opacity: `1`,
            pointerEvents: `auto`,
            transition: `none`,
          },
          [mediaQueries.lg]: {
            width: `sidebarWidth.large`,
          },
        }}
      >
        <div
          sx={{
            boxShadow: `dialog`,
            height: `100%`,
            [mediaQueries.md]: {
              boxShadow: `none`,
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
