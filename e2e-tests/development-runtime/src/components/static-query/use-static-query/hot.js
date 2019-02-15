import React from "react"
import { useStaticQuery, graphql } from "gatsby"

function SupaHotFire(props) {
  const data = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          # %AUTHOR%
          title
        }
      }
    }
  `)

  if (data) {
    return (
      <p {...props}>
        {data.site.siteMetadata.title}: {data.site.siteMetadata.author}
      </p>
    )
  }

  return `Error`
}

export default SupaHotFire
