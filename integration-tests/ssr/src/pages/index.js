import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import(`../test`)

export default function Inline() {
  const { site } = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)
  return (
    <div>
      <h1 className="hi">{site.siteMetadata.title}</h1>
    </div>
  )
}
