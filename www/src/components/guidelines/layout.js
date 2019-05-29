import React from "react"
import PropTypes from "prop-types"
import { Global } from "@emotion/core"
import { ThemeProvider } from "emotion-theming"

import theme from "../../utils/guidelines/theme"

import { Box } from "./system"
import Header from "./header"
import AnotherHeader from "../navigation"
import Banner from "../banner"
import Footer from "../shared/footer-links"

import { sizes } from "../../utils/presets"

// Import Futura PT typeface
import "../../fonts/Webfonts/futurapt_book_macroman/stylesheet.css"
import "../../fonts/Webfonts/futurapt_bookitalic_macroman/stylesheet.css"
import "../../fonts/Webfonts/futurapt_demi_macroman/stylesheet.css"
import "../../fonts/Webfonts/futurapt_demiitalic_macroman/stylesheet.css"
import "../../fonts/Webfonts/futurapt_bold_macroman/MyFontsWebfontsKit.css"

const Layout = ({ children, background, pathname }) => (
  <ThemeProvider theme={theme}>
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
    <Banner />
    <AnotherHeader pathname={pathname} />
    <Box
      bg="white"
      position="relative"
      pt={{
        xxs: sizes.bannerHeight,
        sm: `calc(${sizes.headerHeight} + ${sizes.bannerHeight})`,
      }}
    >
      {background && background}
      <Header />
      <Box className="main-body">
        {children}
        <Footer />
      </Box>
    </Box>
  </ThemeProvider>
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
