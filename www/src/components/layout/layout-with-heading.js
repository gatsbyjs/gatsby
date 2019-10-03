/** @jsx jsx */
import { jsx } from "theme-ui"
import PropTypes from "prop-types"
import { Helmet } from "react-helmet"

import Banner from "../banner"
import PageHeading from "./page-heading"
import Navigation from "../navigation"
import MobileNavigation from "../navigation-mobile"
import { mediaQueries } from "../../gatsby-plugin-theme-ui"
import SkipNavLink from "../skip-nav-link"

// Import Futura PT typeface
import "../../assets/fonts/futura"

const LayoutWithHeading = props => {
  const {
    children,
    location: { pathname },
    pageTitle = ``,
    pageIcon,
  } = props

  const isHomepage = pathname === `/`

  return (
    <div className={` ${isHomepage ? `isHomepage` : ``}`}>
      <Helmet>
        <title>{pageTitle ? `${pageTitle} | GatsbyJS` : `GatsbyJS`}</title>
        <meta name="twitter:site" content="@gatsbyjs" />
        <meta name="og:type" content="website" />
        <meta name="og:site_name" content="GatsbyJS" />
        <link rel="canonical" href={`https://gatsbyjs.org${pathname}`} />
        <html lang="en" />
      </Helmet>
      <SkipNavLink />
      <Banner />
      <Navigation pathname={props.location.pathname} />
      <div
        sx={{
          pt: t => t.sizes.bannerHeight,
          pb: t => t.fontSizes[10],

          [mediaQueries.md]: {
            ml: t => t.sizes.pageHeadingDesktopWidth,
            pt: t => `calc(${t.sizes.bannerHeight} + ${t.sizes.headerHeight})`,
            pb: 0,
          },
        }}
      >
        {pageTitle && <PageHeading title={pageTitle} icon={pageIcon} />}
        {children}
      </div>
      <MobileNavigation />
    </div>
  )
}

LayoutWithHeading.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.object.isRequired,
  pageTitle: PropTypes.string,
  pageIcon: PropTypes.string,
}

export default LayoutWithHeading
