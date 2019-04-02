import React from "react"
import { Link } from "gatsby"
import LocalizedLink from "./localizedLink"

const LocaleContext = React.createContext()

const Layout = ({ children, pageContext: { locale } }) => (
  <LocaleContext.Provider value={{ locale }}>
    <div className="global-wrapper">
      <header className="global-header">
        <nav>
          <LocalizedLink to="/" aria-label="Back to home">
            Homepage
          </LocalizedLink>
          <div>
            <Link to="/" hrefLang="en">
              English
            </Link>
            {` `}/{` `}
            <Link to="/de" hrefLang="de">
              Deutsch
            </Link>
          </div>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  </LocaleContext.Provider>
)

export { Layout, LocaleContext }
