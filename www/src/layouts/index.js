import React from "react"
import Helmet from "react-helmet"
import { OutboundLink } from "gatsby-plugin-google-analytics"

import Navigation from "../components/navigation"
import MobileNavigation from "../components/navigation-mobile"
import SidebarBody from "../components/sidebar-body"
import SearchBar from "../components/searchbar-body"
import tutorialSidebar from "../pages/docs/tutorial-links.yml"
import docsSidebar from "../pages/docs/doc-links.yaml"
import featuresSidebar from "../pages/docs/features-links.yaml"
import { rhythm, options } from "../utils/typography"
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

class DefaultLayout extends React.Component {
  render() {
    const isHomepage = this.props.location.pathname == `/`
    const isBlog = this.props.location.pathname.slice(0, 6) === `/blog/`
    const isBlogLanding = this.props.location.pathname === `/blog/`
    const isDoc = this.props.location.pathname.slice(0, 6) === `/docs/`
    const isTutorial =
      this.props.location.pathname.slice(0, 10) === `/tutorial/`
    const isFeature = this.props.location.pathname.slice(0, 9) === `/features`
    const isPackageSearchPage =
      this.props.location.pathname.slice(0, 8) === `/plugins` ||
      this.props.location.pathname.slice(0, 9) === `/packages`
    const isPackageReadme =
      this.props.location.pathname.slice(0, 16) === `/packages/gatsby`

    const hasSidebar =
      isDoc || isTutorial || isFeature || isPackageSearchPage || isPackageReadme
    const isSearchSource = hasSidebar || isBlog

    const packageSidebarWidth = rhythm(17)

    const leftPadding = rhythmSize => {
      if (isPackageReadme || isPackageSearchPage) {
        return packageSidebarWidth
      } else if (hasSidebar) {
        return rhythm(rhythmSize)
      } else {
        return 0
      }
    }

    const sidebarStyles = {
      borderRight: `1px solid ${colors.ui.light}`,
      backgroundColor: colors.ui.whisper,
      width: rhythm(10),
      display: `none`,
      position: `fixed`,
      top: `calc(${presets.headerHeight} + 2.8rem - 1px)`,
      overflowY: `auto`,
      height: `calc(100vh - ${presets.headerHeight} - 2.8rem + 1px)`,
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
    }

    const sidebarStylesDesktop = {
      [presets.Desktop]: {
        width: rhythm(12),
        padding: rhythm(1),
      },
    }

    let searchBarDisplayProperty
    let childrenMobileDisplay
    let childrenTabletDisplay
    if (isPackageSearchPage && !isPackageReadme) {
      searchBarDisplayProperty = { display: `block` }
      childrenMobileDisplay = { display: `none` }
      childrenTabletDisplay = { display: `block` }
    } else if (isPackageSearchPage && isPackageReadme) {
      searchBarDisplayProperty = {
        [presets.Mobile]: {
          display: `none`,
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
      // overrides of sidebarStyles
      display: `none`,
      width: `100vw`,
      padding: rhythm(3 / 4),
      zIndex: 1,
      [presets.Desktop]: {
        ...sidebarStyles,
        position: `fixed`,
        overflowY: `hidden`,
        width: packageSidebarWidth,
      },
      ...searchBarDisplayProperty,
    }

    return (
      <div className={isHomepage ? `is-homepage` : ``}>
        <Helmet defaultTitle={`GatsbyJS`} titleTemplate={`%s | GatsbyJS`}>
          <meta name="twitter:site" content="@gatsbyjs" />
          <meta name="og:type" content="website" />
          <meta name="og:site_name" content="GatsbyJS" />
          <link
            rel="canonical"
            href={`https://gatsbyjs.org${this.props.location.pathname}`}
          />
          <html lang="en" />
        </Helmet>
        <div
          css={{
            width: `100%`,
            padding: rhythm(1 / 2),
            background: colors.ui.bright,
            color: colors.gatsby,
            fontFamily: options.headerFontFamily.join(`,`),
            textAlign: `center`,
            boxShadow: `inset 0px -3px 2px 0px ${colors.ui.bright}`,
            zIndex: `3`,
            position: isHomepage || isBlogLanding ? `absolute` : `fixed`,
          }}
        >
          Live 2-day Gatsby training with Kyle Mathews! Sign up for{` `}
          <OutboundLink
            target="_blank"
            rel="noopener"
            href="https://workshop.me/2018-05-gatsby"
          >
            NYC in May
          </OutboundLink>!
        </div>
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
              ...sidebarStylesDesktop,
            }}
          >
            <SidebarBody yaml={docsSidebar} />
          </div>

          {/* This is for the searchbar template */}
          <div
            css={{
              ...searchbarStyles,
              [presets.Tablet]: {
                display: isPackageSearchPage
                  ? `block`
                  : isPackageSearchPage && isPackageReadme ? `block` : `none`,
                width: packageSidebarWidth,
                position: `fixed`,
                background: colors.ui.whisper,
                borderRight: `1px solid ${colors.ui.light}`,
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
              ...sidebarStylesDesktop,
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
              ...sidebarStylesDesktop,
            }}
          >
            <SidebarBody yaml={featuresSidebar} />
          </div>

          <div
            css={{
              marginTop: isHomepage || isBlog ? 0 : `calc(2.8rem - 1px)`,
              ...childrenMobileDisplay,
              [presets.Tablet]: {
                paddingLeft: leftPadding(10),
                ...childrenTabletDisplay,
              },
              [presets.Desktop]: {
                paddingLeft: leftPadding(12),
              },
            }}
            className={isSearchSource && `docSearch-content`}
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
