import React from "react"
import { I18nProvider } from "@lingui/react"
import { getLocaleAndBasePath } from "../utils/i18n"

export default function Layout({ location, children }) {
  const { locale } = getLocaleAndBasePath(location.pathname)
  // TODO lazy-load catalog when locale changes
  const catalog = require(`../data/locales/${locale}/messages.js`)
  return (
    <I18nProvider language={locale} catalogs={{ [locale]: catalog }}>
      {children}
    </I18nProvider>
  )
}
