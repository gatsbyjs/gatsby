import React, { useState } from "react"
import { defaultLang, getLocaleAndBasePath } from "../utils/i18n"

let PluginLibraryWrapper
export const LocaleContext = React.createContext(defaultLang)

export default ({ pageContext, location, children }) => {
  const [loaded, setLoaded] = useState(false)

  const promise = import(`../components/layout/plugin-library-wrapper`)
  if (pageContext.layout === `plugins` && !loaded) {
    promise.then(pl => {
      PluginLibraryWrapper = pl.default
      setLoaded(true)
    })
    return null
  } else if (pageContext.layout === `plugins` && loaded) {
    return (
      <PluginLibraryWrapper location={location}>
        {children}
      </PluginLibraryWrapper>
    )
  }

  const [locale] = getLocaleAndBasePath(location)

  // TODO support locale context on plugin pages
  return (
    <LocaleContext.Provider value={locale || defaultLang}>
      {children}
    </LocaleContext.Provider>
  )
}
