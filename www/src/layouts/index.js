import React from "react"
import Helmet from "react-helmet"
import { OutboundLink } from "gatsby-plugin-google-analytics"

import Navigation from "../components/navigation"
import MobileNavigation from "../components/navigation-mobile"
import "../css/prism-coy.css"
import presets from "../utils/presets"

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
          className={`main-body`}
          css={{
            paddingTop: 0,
            [presets.Tablet]: {
              margin: `0 auto`,
              paddingTop: isHomepage ? 0 : presets.headerHeight,
            },
          }}
        >
          {this.props.children}
        </div>
        <MobileNavigation />
      </div>
    )
  }
}

export default DefaultLayout
