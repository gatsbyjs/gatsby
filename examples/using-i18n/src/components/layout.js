import React from "react"
import Navigation from "./navigation"

const LocaleContext = React.createContext()

// Use the built-in Context API to make the "locale" available to every component in the tree
// This e.g. enables the LocalizedLink to function correctly
// As this component wraps every page (due to the wrapPageElement API) we can be sure to have
// the locale available everywhere!
const Layout = ({ children, pageContext: { locale } }) => (
  <LocaleContext.Provider value={{ locale }}>
    <div className="global-wrapper">
      <header className="global-header">
        <Navigation />
      </header>
      <main>{children}</main>
    </div>
  </LocaleContext.Provider>
)

export { Layout, LocaleContext }
