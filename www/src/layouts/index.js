import React from "react"
import { IntlProvider } from "react-intl"
import { defaultLang, getLocaleAndBasePath, getMessages } from "../utils/i18n"

export default ({ location, children }) => {
  const { locale } = getLocaleAndBasePath(location.pathname)

  return (
    <IntlProvider
      locale={locale}
      messages={getMessages(locale)}
      defaultLocale={defaultLang}
    >
      {children}
    </IntlProvider>
  )
}
