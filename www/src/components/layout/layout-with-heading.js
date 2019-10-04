import React from "react"
import PropTypes from "prop-types"
import { Helmet } from "react-helmet"
import { SkipNavLink } from "@reach/skip-nav"
import styled from "@emotion/styled"

import Banner from "../banner"
import PageHeading from "./page-heading"
import Navigation from "../navigation"
import MobileNavigation from "../navigation-mobile"

import { mediaQueries, sizes, fontSizes } from "../../utils/presets"
import { skipLink } from "../../utils/styles"

// Import Futura PT typeface
import "../../assets/fonts/futura"

const Content = styled(`div`)`
  padding-top: ${sizes.bannerHeight};
  padding-bottom: ${fontSizes[10]};

  ${mediaQueries.md} {
    margin-left: ${sizes.pageHeadingDesktopWidth};
    padding-top: calc(${sizes.bannerHeight} + ${sizes.headerHeight});
    padding-bottom: 0;
  }
`

const StyledSkipNavLink = styled(SkipNavLink)({
  ...skipLink,
})

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

      <StyledSkipNavLink>Skip to main content</StyledSkipNavLink>

      <Banner />

      <Navigation pathname={props.location.pathname} />

      <Content>
        {pageTitle && <PageHeading title={pageTitle} icon={pageIcon} />}
        {children}
      </Content>

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
