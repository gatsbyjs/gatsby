import React from "react"

import { Link } from "gatsby"

export default ({ children, to, href, activeClassName, ...other }) => {
  const path = to || href

  const internal = /^\/(?!\/)/.test(path)

  if (internal) {
    return (
      <Link to={path} activeClassName={activeClassName} {...other}>
        {children}
      </Link>
    )
  }

  return (
    <a href={to} {...other}>
      {children}
    </a>
  )
}
