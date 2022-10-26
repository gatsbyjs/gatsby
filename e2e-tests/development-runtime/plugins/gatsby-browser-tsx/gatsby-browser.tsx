import * as React from "react"
import { GatsbyBrowser } from "gatsby"

export const wrapPageElement: GatsbyBrowser["wrapPageElement"] = ({ element }) => {
  return (
    <>
      <div className="gatsby-browser-tsx" data-content="TSX with gatsby-browser works" />
      {element}
    </>
  )
}