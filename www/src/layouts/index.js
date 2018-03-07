import React from "react"
import Helmet from "react-helmet"

import Navigation from "../components/navigation"
import MobileNavigation from "../components/navigation-mobile"
import SidebarBody from "../components/sidebar-body"
import SearchBar from "../components/searchbar-body"
import tutorialSidebar from "../pages/docs/tutorial-links.yml"
import docsSidebar from "../pages/docs/doc-links.yaml"
import featuresSidebar from "../pages/docs/features-links.yaml"
import { rhythm, scale } from "../utils/typography"
import presets, { colors } from "../utils/presets"
import hex2rgba from "hex2rgba"
import "../css/prism-coy.css"

// Import Futura PT typeface
import "../fonts/Webfonts/futurapt_book_macroman/stylesheet.css"
import "../fonts/Webfonts/futurapt_bookitalic_macroman/stylesheet.css"
import "../fonts/Webfonts/futurapt_demi_macroman/stylesheet.css"
import "../fonts/Webfonts/futurapt_demiitalic_macroman/stylesheet.css"

// Other fonts
import "typeface-spectral"
import "typeface-space-mono"
import searchbarBody from "../components/searchbar-body"

class DefaultLayout extends React.Component {
  render() {
    const isHomepage = this.props.location.pathname == `/`
    const isDoc = this.props.location.pathname.slice(0, 6) === `/docs/`
    const isTutorial =
      this.props.location.pathname.slice(0, 10) === `/tutorial/`
    const isFeature = this.props.location.pathname.slice(0, 9) === `/features`
    const isPlugin = this.props.location.pathname.slice(0, 8) === `/plugin`
    const isPackage = this.props.location.pathname.slice(0, 9) === `/packages`
    const isPackageReadme =
      this.props.location.pathname.slice(0, 16) === `/packages/gatsby`

    const hasSidebar =
      isDoc ||
      isTutorial ||
      isFeature ||
      isPlugin ||
      isPackage ||
      isPackageReadme

    const leftPadding = rhythmSize => {
      if (this.props.location.pathname.slice(0, 9) === `/packages`) {
        return rhythm(18)
      } else if (hasSidebar) {
        return rhythm(rhythmSize)
      } else {
        return 0
      }
    }

    const sidebarStyles = {
      borderRight: `1px solid ${colors.ui.light}`,
      backgroundColor: colors.ui.whisper,
      boxShadow: `inset 0 4px 5px 0 ${hex2rgba(
        colors.gatsby,
        presets.shadowKeyPenumbraOpacity
      )}, inset 0 1px 10px 0 ${hex2rgba(
        colors.lilac,
        presets.shadowAmbientShadowOpacity
      )}, inset 0 2px 4px -1px ${hex2rgba(
        colors.lilac,
        presets.shadowKeyUmbraOpacity
      )}`,
      width: rhythm(10),
      display: `none`,
      position: `fixed`,
      top: `calc(${presets.headerHeight} - 1px)`,
      overflowY: `auto`,
      height: `calc(100vh - ${presets.headerHeight} + 1px)`,
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
      [presets.Desktop]: {
        width: rhythm(12),
        padding: rhythm(1),
      },
    }

    let searchBarDisplayProperty
    let childrenMobileDisplay
    let childrenTabletDisplay
    if (isPackage && !isPackageReadme) {
      searchBarDisplayProperty = { display: `block` }
      childrenMobileDisplay = { display: `none` }
      childrenTabletDisplay = { display: `block` }
    } else if (isPackage && isPackageReadme) {
      searchBarDisplayProperty = {
        [presets.Mobile]: {
          display: `none`,
        },
        [presets.Tablet]: {
          display: `block`,
        },
      }
      childrenMobileDisplay = { display: `block` }
      childrenTabletDisplay = { display: `block` }
    } else {
      searchBarDisplayProperty = {
        display: `none`,
      }
      childrenMobileDisplay = { display: `block` }
      childrenTabletDisplay = { display: `block` }
    }
    const searchbarStyles = {
      ...sidebarStyles,
      // overrides of sidebarStyles
      width: `100vw`,
      padding: rhythm(1),
      overflowY: `hidden`,
      [presets.Desktop]: {
        width: rhythm(17),
      },
      ...searchBarDisplayProperty,
    }

    return (
      <div className={isHomepage ? `is-homepage` : ``}>
        <Helmet defaultTitle={`GatsbyJS`} titleTemplate={`%s | GatsbyJS`}>
          <meta name="twitter:site" content="@gatsbyjs" />
          <meta name="og:type" content="website" />
          <meta name="og:site_name" content="GatsbyJS" />
          <html lang="en" />
        </Helmet>
        <Navigation pathname={this.props.location.pathname} />
        <div
          className={hasSidebar ? `main-body has-sidebar` : `main-body`}
          css={{
            paddingTop: 0,
            [presets.Tablet]: {
              margin: `0 auto`,
              paddingTop: isHomepage ? 0 : presets.headerHeight,
            },
          }}
        >
          {/* TODO Move this under docs/index.js once Gatsby supports multiple levels
               of layouts */}
          <div
            css={{
              ...sidebarStyles,
              [presets.Tablet]: {
                display: isDoc ? `block` : `none`,
              },
            }}
          >
            <SidebarBody yaml={docsSidebar} />
          </div>

          {/* This is for the searchbar template */}
          <div
            css={{
              ...searchbarStyles,
              [presets.Tablet]: {
                display: isPackage
                  ? `block`
                  : isPackage && isPackageReadme ? `block` : `none`,
                width: rhythm(17),
              },
            }}
          >
            <SearchBar history={this.props.history} />
          </div>

          {/* TODO Move this under docs/tutorial/index.js once Gatsby supports multiple levels
               of layouts */}
          <div
            css={{
              ...sidebarStyles,
              [presets.Tablet]: {
                display: isTutorial ? `block` : `none`,
              },
            }}
          >
            <SidebarBody yaml={tutorialSidebar} />
          </div>
          <div
            css={{
              ...sidebarStyles,
              [presets.Tablet]: {
                display: isFeature ? `block` : `none`,
              },
            }}
          >
            <SidebarBody yaml={featuresSidebar} />
          </div>

          <div
            css={{
              ...childrenMobileDisplay,
              [presets.Tablet]: {
                paddingLeft: leftPadding(10),
                ...childrenTabletDisplay,
              },
              [presets.Desktop]: {
                paddingLeft: leftPadding(12),
              },
            }}
          >
            {this.props.children()}
          </div>
        </div>
        <MobileNavigation />
      </div>
    )
  }
}

module.exports = DefaultLayout
