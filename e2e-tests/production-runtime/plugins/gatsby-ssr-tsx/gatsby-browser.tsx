import * as React from "react"
import { GatsbyBrowser } from "gatsby"

export const wrapPageElement: GatsbyBrowser["wrapPageElement"] = ({ element }) => {
  return (
    <>
      <div className="gatsby-ssr-tsx" data-content="TSX with gatsby-ssr works" />
      {element}
    </>
  )
}