/** @jsx jsx */
import { jsx } from "theme-ui"
import PropTypes from "prop-types"
import { Global } from "@emotion/core"

import { globalStyles } from "../../utils/styles/global"
import { Box } from "./system"
import Header from "./header"
import PageMetadata from "../page-metadata"
import Footer from "../shared/footer-links"

const Layout = ({ children, background, pageTitle }) => (
  <Box bg="background" position="relative">
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
    <PageMetadata
      title={pageTitle ? `${pageTitle} | Guidelines` : `Guidelines`}
    />
    {background && background}
    <Header />
    <Box as="main" className="main-body">
      {children}
      <Footer />
    </Box>
  </Box>
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
