/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import PropTypes from "prop-types"
import { Helmet } from "react-helmet"
import { Global } from "@emotion/core"

import { globalStyles } from "../../utils/styles/global"
import { Box } from "./system"
import Header from "./header"
import AnotherHeader from "../navigation"
import Banner from "../banner"
import Footer from "../shared/footer-links"

// Import Futura PT typeface
import "../../assets/fonts/futura"

const Layout = ({ children, background, pathname, pageTitle }) => (
  <React.Fragment>
    <Global
      styles={{
        ".ReactModal__Overlay": {
          opacity: 0,
          transform: `translateY(100%)`,
          transition: `all 300ms ease-in-out`,
        },
        ".ReactModal__Overlay--after-open": {
          opacity: 1,
          transform: `translateY(0%)`,
        },
        ".ReactModal__Overlay--before-close": {
          opacity: 1,
          transform: `translateY(100%)`,
        },
      }}
    />
    <Global styles={globalStyles} />
    <Helmet>
      <title>
        {pageTitle ? `${pageTitle} | Guidelines | GatsbyJS` : `GatsbyJS`}
      </title>
      <meta name="twitter:site" content="@gatsbyjs" />
      <meta name="og:type" content="website" />
      <meta name="og:site_name" content="GatsbyJS" />
      <link rel="canonical" href={`https://gatsbyjs.org${pathname}`} />
      <html lang="en" />
    </Helmet>
    <Banner />
    <AnotherHeader pathname={pathname} />
    <Box
      bg="background"
      position="relative"
      sx={{
        pt: [
          t => t.sizes.bannerHeight,
          t => `calc(${t.sizes.headerHeight} + ${t.sizes.bannerHeight})`,
        ],
      }}
    >
      {background && background}
      <Header />
      <Box as="main" className="main-body">
        {children}
        <Footer />
      </Box>
    </Box>
  </React.Fragment>
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
