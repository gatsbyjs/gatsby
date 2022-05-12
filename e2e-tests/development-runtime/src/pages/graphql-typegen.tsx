import React from "react"
import { graphql, PageProps } from "gatsby"

function GraphQLTypegen({ data }: PageProps<Queries.GraphQLTypegenQuery>) {
  return (
    <p>
      {data?.site?.siteMetadata?.title}
    </p>
  )
}

export const query = graphql`
  query GraphQLTypegen{
    site {
      siteMetadata {
        # %AUTHOR%
        title
      }
    }
  }
  fragment SiteInformation on Site {
    buildTime
    # %TRAILING_SLASH%
  }
`

export default GraphQLTypegen
