/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"

import { Global } from "@emotion/core"

import { getItemList } from "../utils/sidebar/item-list"
import { globalStyles } from "../utils/styles/global"
import { breakpointGutter } from "../utils/styles"
import Banner from "../components/banner"
import Navigation from "../components/navigation"
import MobileNavigation from "../components/navigation-mobile"
import PageWithSidebar from "../components/page-with-sidebar"
import SiteMetadata from "../components/site-metadata"
import SkipNavLink from "../components/skip-nav-link"
import "../assets/fonts/futura"
import { defaultLang } from "../utils/i18n"

export const LocaleContext = React.createContext(defaultLang)

export default function DefaultLayout({
  location,
  locale,
  enableScrollSync,
  children,
}) {
  const itemList = getItemList(location.pathname)
  const isSidebarDisabled = !itemList

  return (
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
            pt: t => `calc(${t.sizes.bannerHeight} + ${t.sizes.headerHeight})`,
            pb: 0,
          },
        }}
      >
        <PageWithSidebar
          disable={isSidebarDisabled}
          itemList={itemList}
          location={location}
          enableScrollSync={enableScrollSync}
          renderContent={() => children}
        />
      </div>
      <MobileNavigation />
    </LocaleContext.Provider>
  )
}
