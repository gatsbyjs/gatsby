import * as React from "react"
import { Slice } from "gatsby"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <Slice alias="header" size={isRootPath ? 'large': 'medium'}>{title}</Slice>
      <main>{children}</main>
      <Slice alias="footer" />
    </div>
  )
}

export default Layout
