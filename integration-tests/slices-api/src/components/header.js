import * as React from "react"
import { Link } from "gatsby"

const Header = ({children, size = 'medium'}) => {
  let header = (
    <Link className="header-link-home" to="/">
      {children}
    </Link>
  )

  if (size === "large") {
    header = (
      <h1 className="main-heading">
        <Link to="/">{children}</Link>
      </h1>
    )
  }

  return (
    <header className="global-header">
      {header}
    </header>
  )
}

export default Header