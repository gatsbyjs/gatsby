/** @jsx jsx */
import { jsx } from "theme-ui"
import { I18nProvider } from "@lingui/react"
import BaseLayout from "../components/layout"
import { getLocaleAndBasePath } from "../utils/i18n"

export default function Layout({ location, children }) {
  if (location.state && location.state.isModal) {
    return children
  }
  const { locale } = getLocaleAndBasePath(location.pathname)
  const catalog = require(`../data/locales/${locale}/messages.js`)
  return (
    <I18nProvider language={locale} catalogs={{ [locale]: catalog }}>
      <BaseLayout location={location} locale={locale}>
        {children}
      </BaseLayout>
    </I18nProvider>
  )
}
