import React from "react"
import { useStaticQuery, graphql } from "gatsby"

export default function Author() {
  const { site } = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          author
        }
      }
    }
  `)
  return <div>{site.siteMetadata.author}</div>
}
