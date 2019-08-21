import React from "react"
import { graphql } from "gatsby"
import Details from "../components/details"
import Social from "../components/social"

export default ({ data }) => (
  <div>
    Hello world! This is {data.site.siteMetadata.title}
    <Details data={data} />
    <Social data={data} />
  </div>
)

export const pageQuery = graphql`
  query SiteQuery {
    site {
      siteMetadata {
        title
      }
      ...DetailsFragment
      ...SocialFragment
    }
  }
`

/*
  instead of...

export const pageQuery = graphql`
  query SiteQuery {
    site {
      siteMetadata {
        title
        details {
          url
          description
        }
        social {
          twitter
        }
      }
    }
  }
`
*/
