import React, { Fragment } from "react"
import PluginSearchBar from "./plugin-searchbar-body"
import { rhythm } from "../utils/typography"
import { colors, mediaQueries, sizes } from "../utils/presets"

const PageWithPluginSearchBar = ({ isPluginsIndex, location, children }) => (
  <Fragment>
    <nav
      css={{
        ...styles.sidebar,
        // mobile: hide PluginSearchBar when on gatsbyjs.org/packages/foo, aka package README page
        display: !isPluginsIndex ? `none` : false,
      }}
      aria-label="Plugin navigation"
    >
      <PluginSearchBar location={location} />
    </nav>
    <main
      id={`reach-skip-nav`}
      css={{
        ...styles.content,
        // mobile: hide README on gatsbyjs.org/plugins index page
        display: isPluginsIndex ? `none` : false,
      }}
    >
      {children}
    </main>
  </Fragment>
)

const widthDefault = rhythm(14)
const widthLarge = rhythm(16)

const styles = {
  sidebar: {
    height: `calc(100vh - ${sizes.headerHeight})`,
    width: `100%`,
    zIndex: 1,
    top: `calc(${sizes.headerHeight} + ${sizes.bannerHeight} - 1px)`,
    [mediaQueries.md]: {
      display: `block`,
      width: widthDefault,
      position: `fixed`,
      background: colors.white,
      borderRight: `1px solid ${colors.ui.border.subtle}`,
    },
    [mediaQueries.lg]: {
      width: widthLarge,
    },
  },
  content: {
    [mediaQueries.md]: {
      display: `block`,
      paddingLeft: widthDefault,
    },
    [mediaQueries.lg]: {
      paddingLeft: widthLarge,
    },
  },
}

export default PageWithPluginSearchBar
