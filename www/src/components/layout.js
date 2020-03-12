/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"

import { Global } from "@emotion/core"
import { IconContext } from "react-icons"

import { globalStyles } from "../utils/styles/global"
import { breakpointGutter } from "../utils/styles"
import Banner from "./banner"
import Navigation from "./navigation"
import MobileNavigation from "./navigation-mobile"
import SiteMetadata from "./site-metadata"
import SkipNavLink from "./skip-nav-link"
import "../assets/fonts/futura"
import { defaultLang } from "../utils/i18n"

export const LocaleContext = React.createContext(defaultLang)

export default function DefaultLayout({ location, locale, children }) {
  return (
    <IconContext.Provider value={{ style: { verticalAlign: "middle" } }}>
      <LocaleContext.Provider value={locale || defaultLang}>
        <Global styles={globalStyles} />
        <SiteMetadata pathname={location.pathname} locale={locale} />
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
              pt: t =>
                `calc(${t.sizes.bannerHeight} + ${t.sizes.headerHeight})`,
              pb: 0,
            },
          }}
        >
          {children}
        </div>
        <MobileNavigation />
      </LocaleContext.Provider>
    </IconContext.Provider>
  )
}
