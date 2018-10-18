import React from "react"
import PropTypes from "prop-types"
import Helmet from "react-helmet"
import { SkipNavLink } from "@reach/skip-nav"
import { css } from "emotion"

import presets, { colors } from "../../utils/presets"
import TopBanner from "./top-banner"
import Navigation from "../navigation"
import MobileNavigation from "../navigation-mobile"

// Import Futura PT typeface
import "../../fonts/Webfonts/futurapt_book_macroman/stylesheet.css"
import "../../fonts/Webfonts/futurapt_bookitalic_macroman/stylesheet.css"
import "../../fonts/Webfonts/futurapt_demi_macroman/stylesheet.css"
import "../../fonts/Webfonts/futurapt_demiitalic_macroman/stylesheet.css"
// Other fonts
import "typeface-spectral"

let windowWidth

class Layout extends React.Component {
  render() {
    const {
      children,
      location: { pathname },
      pageTitle = "",
    } = this.props

    const isHomepage = pathname === `/`

    return (
      <React.Fragment>
        <Helmet>
          <title>{pageTitle ? `${pageTitle} | GatsbyJS` : "GatsbyJS"}</title>
          <meta name="twitter:site" content="@gatsbyjs" />
          <meta name="og:type" content="website" />
          <meta name="og:site_name" content="GatsbyJS" />
          <link rel="canonical" href={`https://gatsbyjs.org${pathname}`} />
          <html lang="en" />
        </Helmet>

        <SkipNavLink css={styles.skipLink}>Skip to main content</SkipNavLink>

        <TopBanner />

        <Navigation pathname={this.props.location.pathname} />

        <div
          className={`main-body`}
          css={{
            paddingTop: presets.bannerHeight,
            [presets.Tablet]: {
              margin: `0 auto`,
              paddingTop: isHomepage
                ? presets.bannerHeight
                : `calc(${presets.bannerHeight} + ${presets.headerHeight})`,
            },
          }}
        >
          {children}
        </div>

        <MobileNavigation />
      </React.Fragment>
    )
  }
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.object.isRequired,
  pageTitle: PropTypes.string,
}

export default Layout

const styles = {
  skipLink: {
    border: `0`,
    clip: `rect(0 0 0 0)`,
    height: 1,
    width: 1,
    margin: -1,
    padding: 0,
    overflow: `hidden`,
    position: `absolute`,
    zIndex: 100,
    fontSize: `0.85rem`,
    ":focus": {
      padding: `0.9rem`,
      position: `fixed`,
      top: 10,
      left: 10,
      background: `white`,
      textDecoration: `none`,
      width: `auto`,
      height: `auto`,
      clip: `auto`,
    },
  },
}
