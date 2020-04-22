import React from "react"
import { graphql } from "gatsby"

const Details = ({ data }) => (
  <div>
    {data.site.siteMetadata.details.url} -{` `}
    {data.site.siteMetadata.details.description}
  </div>
)

export default Details

export const detailsFragment = graphql`
  fragment DetailsFragment on Site {
    siteMetadata {
      details {
        url
        description
      }
    }
  }
`
