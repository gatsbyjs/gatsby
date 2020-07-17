import React from "react"
import { useStaticQuery, graphql } from "gatsby"

export default function Github() {
  const { site } = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          github
        }
      }
    }
  `)
  return <div>{site.siteMetadata.github}</div>
}
