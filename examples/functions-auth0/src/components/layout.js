import React from "react"
import Header from "./header"

const Layout = ({ children }) => {
  return (
    <div>
      <Header />
      <div className="pt-5">{children}</div>
    </div>
  )
}

export default Layout
