/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"

import { Global } from "@emotion/core"

import { globalStyles } from "../utils/styles/global"
import { breakpointGutter } from "../utils/styles"
import Banner from "./banner"
import Navigation from "./navigation"
import MobileNavigation from "./navigation-mobile"
import SiteMetadata from "./site-metadata"
import SkipNavLink from "./skip-nav-link"
import "../assets/fonts/futura"

export default function DefaultLayout({ location, children }) {
  if (location.state?.isModal) {
    return (
      <>
        <SiteMetadata pathname={location.pathname} />
        {children}
      </>
    )
  }

  return (
    <>
      <Global styles={globalStyles} />
      <SiteMetadata pathname={location.pathname} />
      <SkipNavLink />
      <Banner />
      <Navigation pathname={location.pathname} />
      <div
        className={`main-body docSearch-content`}
        sx={{
          px: `env(safe-area-inset-left)`,
          pt: t => t.sizes.bannerHeight,
          // make room for the mobile navigation
          pb: t => t.sizes.headerHeight,
          [breakpointGutter]: {
            pt: t => `calc(${t.sizes.bannerHeight} + ${t.sizes.headerHeight})`,
            pb: 0,
          },
        }}
      >
        {children}
      </div>
      <MobileNavigation />
    </>
  )
}
