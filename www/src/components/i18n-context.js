import React from "react"
import { defaultLang } from "../utils/i18n"

const LocaleContext = React.createContext(defaultLang)

export function I18nProvider({ locale = defaultLang, children }) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  return React.useContext(LocaleContext)
}
