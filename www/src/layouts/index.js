import React from "react"
import { I18nProvider } from "@lingui/react"
import { getLocaleAndBasePath } from "../utils/i18n"

export default function Layout({ location, children }) {
  const { locale } = getLocaleAndBasePath(location.pathname)
  // const catalog = require(`../data/locales/${locale}/messages.js`)
  return <I18nProvider language={locale}>{children}</I18nProvider>
}
