import React from "react"
import PropTypes from "prop-types"
import Helmet from "react-helmet"
import { SkipNavLink } from "@reach/skip-nav"
import { css } from "emotion"
import facepaint from "facepaint"

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
      <div className={`${layout} ${isHomepage ? `isHomepage` : ``}`}>
        <Helmet>
          <title>{pageTitle ? `${pageTitle} | GatsbyJS` : "GatsbyJS"}</title>
          <meta name="twitter:site" content="@gatsbyjs" />
          <meta name="og:type" content="website" />
          <meta name="og:site_name" content="GatsbyJS" />
          <link rel="canonical" href={`https://gatsbyjs.org${pathname}`} />
          <html lang="en" />
        </Helmet>

        <SkipNavLink className={skipNavLink}>Skip to main content</SkipNavLink>

        <TopBanner />

        <Navigation pathname={this.props.location.pathname} />

        <div className={content}>{children}</div>

        <MobileNavigation />
      </div>
    )
  }
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.object.isRequired,
  pageTitle: PropTypes.string,
}

export default Layout

/* STYLES */

const {
  breakpoints: { tablet },
  bannerHeight,
  headerHeight,
} = presets

const breakpoints = [tablet]
const mq = facepaint(breakpoints.map(bp => `@media (min-width: ${bp}px)`))

const layout = css``

const content = css`
  padding-top: ${bannerHeight};

  ${mq({
    margin: ["", "0 auto"],
    paddingTop: [`${bannerHeight}`, `calc(${bannerHeight} + ${headerHeight})`],
  })};

  .is-homepage & {
    paddingtop: ${bannerHeight};
  }
`

const skipNavLink = css`
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  width: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  position: absolute;
  z-index: 100;
  font-size: 0.85rem;

  &:focus {
    padding: 0.9rem;
    position: fixed;
    top: 10px;
    left: 10px;
    background: white;
    text-decoration: none;
    width: auto;
    height: auto;
    clip: auto;
  }
`
