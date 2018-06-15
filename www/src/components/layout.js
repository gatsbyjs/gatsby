import React from "react"
import Helmet from "react-helmet"
import { OutboundLink } from "gatsby-plugin-google-analytics"

import presets from "../utils/presets"
import { rhythm, options } from "../utils/typography"
import Navigation from "../components/navigation"
import MobileNavigation from "../components/navigation-mobile"
import PageWithSidebar from "../components/page-with-sidebar"
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
    const isHomepage = this.props.location.pathname === `/`

    // SEE: template-docs-markdown for why this.props.isSidebarDisabled is here
    const isSidebarDisabled = this.props.isSidebarDisabled || !this.props.sidebarYaml

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
            background: presets.colors.ui.bright,
            color: presets.colors.gatsby,
            fontFamily: options.headerFontFamily.join(`,`),
            textAlign: `center`,
            boxShadow: `inset 0px -3px 2px 0px ${presets.colors.ui.bright}`,
            zIndex: `3`,
            position: `fixed`,
          }}
        >
          You're viewing the docs for Gatsby v2 beta.{` `}
          <OutboundLink
            href="https://gatsbyjs.org/"
          >
            View the v1 docs instead
          </OutboundLink>.
        </div>
        <Navigation pathname={this.props.location.pathname} />
        <div
          className={`main-body`}
          css={{
            paddingTop: `2.8rem`,
            [presets.Tablet]: {
              margin: `0 auto`,
              paddingTop: isHomepage ? `2.8rem` : `calc(2.8rem + ${presets.headerHeight})`,
            },
          }}
        >
  <PageWithSidebar
            disable={isSidebarDisabled}
            yaml={this.props.sidebarYaml}
            renderContent={() => this.props.children}
          />
        </div>
        <MobileNavigation />
      </div>
    )
  }
}

export default DefaultLayout
