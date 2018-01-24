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
import "../css/searchbox-style.css"

// Import Futura PT typeface
import "../fonts/Webfonts/futurapt_book_macroman/stylesheet.css"
import "../fonts/Webfonts/futurapt_bookitalic_macroman/stylesheet.css"
import "../fonts/Webfonts/futurapt_demi_macroman/stylesheet.css"
import "../fonts/Webfonts/futurapt_demiitalic_macroman/stylesheet.css"

// Other fonts
import "typeface-spectral"
import "typeface-space-mono"

class DefaultLayout extends React.Component {
  render() {
    const isHomepage = this.props.location.pathname == `/`
    const hasSidebar =
      this.props.location.pathname.slice(0, 6) === `/docs/` ||
      this.props.location.pathname.slice(0, 9) === `/packages` ||
      this.props.location.pathname.slice(0, 10) === `/tutorial/` ||
      this.props.location.pathname.slice(0, 9) === `/features`
    const isSearchSource = hasSidebar
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

    const searchbarStyles = {
      borderRight: `1px solid ${colors.b[0]}`,
      backgroundColor: presets.sidebar,
      boxShadow: `inset 0 4px 5px 0 rgba(116, 76, 158, ${
        presets.shadowKeyPenumbraOpacity
      }), inset 0 1px 10px 0 rgba(${presets.shadowColor}, ${
        presets.shadowAmbientShadowOpacity
      }), inset 0 2px 4px -1px rgba(${presets.shadowColor}, ${
        presets.shadowKeyUmbraOpacity
      })`,
      width: rhythm(17),
      padding: rhythm(1),
      display: `none`,
      position: `fixed`,
      top: `calc(${presets.headerHeight} - 1px)`,
      zIndex: 1,
      height: `calc(100vh - ${presets.headerHeight} + 1px)`,
      WebkitOverflowScrolling: `touch`,
      "::-webkit-scrollbar": {
        width: `6px`,
        height: `6px`,
      },
      "::-webkit-scrollbar-thumb": {
        background: presets.lightPurple,
      },
      "::-webkit-scrollbar-track": {
        background: presets.brandLighter,
      },
      [presets.Desktop]: {
        width: rhythm(17),
        padding: rhythm(1),
      },
    }

    return (
      <div>
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
                display:
                  this.props.location.pathname.slice(0, 6) === `/docs/`
                    ? `block`
                    : `none`,
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
                display:
                  this.props.location.pathname.slice(0, 9) === `/packages`
                    ? `block`
                    : `none`,
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
                display:
                  this.props.location.pathname.slice(0, 10) === `/tutorial/`
                    ? `block`
                    : `none`,
              },
            }}
          >
            <SidebarBody yaml={tutorialSidebar} />
          </div>
          <div
            css={{
              ...sidebarStyles,
              [presets.Tablet]: {
                display:
                  this.props.location.pathname.slice(0, 9) === `/features`
                    ? `block`
                    : `none`,
              },
            }}
          >
            <SidebarBody yaml={featuresSidebar} />
          </div>

          <div
            css={{
              [presets.Tablet]: {
<<<<<<< HEAD
                paddingLeft: hasSidebar ? rhythm(10) : 0,
                display:
                  this.props.location.pathname.slice(0, 9) !== `/packages`

                   ? `block`
                   : `none`,
              },
              [presets.Desktop]: {
                paddingLeft: hasSidebar ? rhythm(12) : 0,
              },
            }}
            className={isSearchSource && `docSearch-content`}
          >
            {this.props.children()}
          </div>

          {/* This div displays the contents of any plugin page*/}

          <div
            css={{
              [presets.Tablet]: {
                paddingLeft: hasSidebar ? rhythm(18) : 0,
                display:
                  this.props.location.pathname.slice(0, 9) === `/packages`
                   ? `block`
                   : `none`,
=======
                paddingLeft: leftPadding(10),
>>>>>>> Fix doubling-up layout bug, add border to hits component, add margin to text in packages
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
