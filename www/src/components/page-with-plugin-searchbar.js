import React, { Fragment } from "react"
import PluginSearchBar from "./plugin-searchbar-body"
import { rhythm } from "../utils/typography"
import presets, { colors, breakpoints } from "../utils/presets"
import { scrollbarStyles } from "../utils/styles"

const PageWithPluginSearchBar = ({ isPluginsIndex, location, children }) => (
  <Fragment>
    <section
      css={{
        ...styles.sidebar,
        // mobile: hide PluginSearchBar when on gatsbyjs.org/packages/foo, aka package README page
        display: !isPluginsIndex ? `none` : false,
      }}
    >
      <PluginSearchBar location={location} />
    </section>
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
    height: `calc(100vh - ${presets.headerHeight})`,
    width: `100%`,
    zIndex: 1,
    top: `calc(${presets.headerHeight} + ${presets.bannerHeight} - 1px)`,
    ...scrollbarStyles,
    [breakpoints.Md]: {
      display: `block`,
      width: widthDefault,
      position: `fixed`,
      background: colors.ui.whisper,
      borderRight: `1px solid ${colors.ui.light}`,
    },
    [breakpoints.Lg]: {
      width: widthLarge,
    },
  },
  content: {
    [breakpoints.Md]: {
      display: `block`,
      paddingLeft: widthDefault,
    },
    [breakpoints.Lg]: {
      paddingLeft: widthLarge,
    },
  },
}

export default PageWithPluginSearchBar
