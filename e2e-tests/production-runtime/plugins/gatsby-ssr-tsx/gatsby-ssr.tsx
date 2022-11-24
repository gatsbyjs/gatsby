import * as React from "react"
import { GatsbySSR } from "gatsby"

export const wrapPageElement: GatsbySSR["wrapPageElement"] = ({ element }) => {
  return (
    <>
      <div className="gatsby-ssr-tsx" data-content="TSX with gatsby-ssr works" />
      {element}
    </>
  )
}