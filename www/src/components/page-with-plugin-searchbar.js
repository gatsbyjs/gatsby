/** @jsx jsx */
import { jsx } from "theme-ui"
import { Fragment } from "react"
import PluginSearchBar from "./plugin-searchbar-body"
import { mediaQueries } from "../gatsby-plugin-theme-ui"

const PageWithPluginSearchBar = ({ isPluginsIndex, location, children }) => (
  <Fragment>
    <nav
      sx={{
        // mobile: hide PluginSearchBar when on gatsbyjs.org/packages/foo, aka package README page
        display: !isPluginsIndex ? `none` : false,
        height: t => `calc(100vh - ${t.sizes.headerHeight})`,
        top: t =>
          `calc(${t.sizes.headerHeight} + ${t.sizes.bannerHeight} - 1px)`,
        width: `100%`,
        zIndex: 1,
        [mediaQueries.md]: {
          backgroundColor: `background`,
          borderColor: `ui.border`,
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
          pl: t => t.sizes.pluginsSidebarWidthDefault,
        },
        [mediaQueries.lg]: {
          pl: t => t.sizes.pluginsSidebarWidthLarge,
        },
      }}
    >
      {children}
    </main>
  </Fragment>
)

export default PageWithPluginSearchBar
