import React from "react"
import { defaultLang } from "../utils/i18n"
import { I18nProvider as LinguiProvider } from "@lingui/react"

// Lingui doesn't give access to the locale, so we need our own provider
// to pass it down to child components
const LocaleContext = React.createContext(defaultLang)

export function I18nProvider({ locale = defaultLang, children }) {
  const catalog = require(`../data/locales/${locale}/messages.js`)
  return (
    <LocaleContext.Provider value={locale}>
      <LinguiProvider language={locale} catalogs={{ [locale]: catalog }}>
        {children}
      </LinguiProvider>
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return React.useContext(LocaleContext)
}
