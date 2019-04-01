import React from "react"

const LocaleContext = React.createContext()

const Layout = ({ children, pageContext: { locale } }) => (
  <LocaleContext.Provider value={{ locale }}>{children}</LocaleContext.Provider>
)

export { Layout, LocaleContext }
