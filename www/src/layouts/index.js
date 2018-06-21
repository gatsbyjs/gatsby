import React from "react"
import Helmet from "react-helmet"

import Navigation from "../components/navigation"
import MobileNavigation from "../components/navigation-mobile"
import Sidebar from "../components/sidebar/sidebar"
import SearchBar from "../components/searchbar-body"
import { rhythm } from "../utils/typography"
import presets, { colors } from "../utils/presets"
import findSectionForPath from "../utils/sidebar/find-section-for-path"
import {
  sectionListDocs,
  sectionListFeatures,
  sectionListTutorial,
} from "../utils/sidebar/section-list"
import {
  createLinkDocs,
  createLinkTutorial,
} from "../utils/sidebar/create-link"
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
    const { location } = this.props
    const isHomepage = location.pathname == `/`
    const isBlog = location.pathname.slice(0, 6) === `/blog/`
    const isDoc = location.pathname.slice(0, 6) === `/docs/`
    const isTutorial = location.pathname.slice(0, 10) === `/tutorial/`
    const isFeature = location.pathname.slice(0, 9) === `/features`
    const isPackageSearchPage =
      location.pathname.slice(0, 8) === `/plugins` ||
      location.pathname.slice(0, 9) === `/packages`
    const isPackageReadme =
      location.pathname.slice(0, 16) === `/packages/gatsby`

    const hasSidebar =
      isDoc || isTutorial || isFeature || isPackageSearchPage || isPackageReadme
    const hasDocSidebar = isDoc || isTutorial || isFeature
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

    let sidebarConfig

    if (isDoc) {
      sidebarConfig = {
        sectionList: sectionListDocs,
        createLink: createLinkDocs,
        enableScrollSync: false,
      }
    } else if (isFeature) {
      sidebarConfig = {
        sectionList: sectionListFeatures,
        createLink: createLinkTutorial,
        enableScrollSync: true,
      }
    } else if (isTutorial) {
      sidebarConfig = {
        sectionList: sectionListTutorial,
        createLink: createLinkTutorial,
        enableScrollSync: true,
      }
    }

    const sidebarStyles = {
      borderRight: `1px solid ${colors.ui.light}`,
      backgroundColor: colors.ui.whisper,
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
            href={`https://gatsbyjs.org${location.pathname}`}
          />
          <html lang="en" />
        </Helmet>
        <Navigation pathname={location.pathname} />
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
          {hasDocSidebar && (
            <Sidebar
              sidebarStyles={sidebarStyles}
              location={location}
              sectionList={sidebarConfig.sectionList}
              createLink={sidebarConfig.createLink}
              defaultActiveSection={findSectionForPath(
                location.pathname,
                sidebarConfig.sectionList
              )}
              enableScrollSync={sidebarConfig.enableScrollSync}
              key={location.pathname}
            />
          )}

          {/* This is for the searchbar template */}
          <div
            css={{
              ...searchbarStyles,
              [presets.Tablet]: {
                display: isPackageSearchPage
                  ? `block`
                  : isPackageSearchPage && isPackageReadme
                    ? `block`
                    : `none`,
                width: packageSidebarWidth,
                position: `fixed`,
                background: colors.ui.whisper,
                borderRight: `1px solid ${colors.ui.light}`,
              },
            }}
          >
            <SearchBar history={this.props.history} />
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
