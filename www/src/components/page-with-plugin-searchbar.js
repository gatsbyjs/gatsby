/** @jsx jsx */
import { jsx } from "theme-ui"
import React, { Fragment } from "react"
import PluginSearchBar from "./plugin-searchbar-body"
import { mediaQueries, sizes } from "../utils/presets"

const PageWithPluginSearchBar = ({ isPluginsIndex, location, children }) => (
  <Fragment>
    <nav
      sx={{
        // mobile: hide PluginSearchBar when on gatsbyjs.org/packages/foo, aka package README page
        display: !isPluginsIndex ? `none` : false,
        height: `calc(100vh - ${sizes.headerHeight})`,
        top: `calc(${sizes.headerHeight} + ${sizes.bannerHeight} - 1px)`,
        width: `100%`,
        zIndex: 1,
        [mediaQueries.md]: {
          backgroundColor: `background`,
          borderColor: `ui.border.subtle`,
          borderRightStyle: `solid`,
          borderRightWidth: `1px`,
          display: `block`,
          position: `fixed`,
          width: `pluginsSidebarWidthDefault`,
        },
        [mediaQueries.lg]: {
          width: `pluginsSidebarWidthLarge`,
        },
      }}
      aria-label="Plugin navigation"
    >
      <PluginSearchBar location={location} />
    </nav>
    <main
      id={`reach-skip-nav`}
      sx={{
        // mobile: hide README on gatsbyjs.org/plugins index page
        display: isPluginsIndex ? `none` : false,
        [mediaQueries.md]: {
          display: `block`,
          // todo use theme-ui "sizes" token
          paddingLeft: `21rem`,
        },
        [mediaQueries.lg]: {
          // todo use theme-ui "sizes" token
          paddingLeft: `24rem`,
        },
      }}
    >
      {children}
    </main>
  </Fragment>
)

export default PageWithPluginSearchBar
