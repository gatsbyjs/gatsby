import React from "react"
import { useStaticQuery, graphql } from "gatsby"

export default function Twitter() {
  const { site } = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          twitter
        }
      }
    }
  `)
  return <div>{site.siteMetadata.twitter}</div>
}
