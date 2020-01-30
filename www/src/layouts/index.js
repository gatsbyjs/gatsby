import React, { useState } from "react"
import { IntlProvider } from "react-intl"
import { defaultLang, getLocaleAndBasePath, getMessages } from "../utils/i18n"

let PluginLibraryWrapper
export default ({ pageContext, location, children }) => {
  const { locale } = getLocaleAndBasePath(location.pathname)

  const [loaded, setLoaded] = useState(false)

  const promise = import(`../components/layout/plugin-library-wrapper`)
  let content = children
  if (pageContext.layout === `plugins` && !loaded) {
    promise.then(pl => {
      PluginLibraryWrapper = pl.default
      setLoaded(true)
    })
    return null
  } else if (pageContext.layout === `plugins` && loaded) {
    content = (
      <PluginLibraryWrapper location={location}>
        {children}
      </PluginLibraryWrapper>
    )
  }
  return (
    <IntlProvider
      locale={locale}
      messages={getMessages(locale)}
      defaultLocale={defaultLang}
    >
      {content}
    </IntlProvider>
  )
}
