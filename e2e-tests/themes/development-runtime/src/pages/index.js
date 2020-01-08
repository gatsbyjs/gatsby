import React from "react"
import { graphql } from "gatsby"

export default ({ data }) => (
  <>
    <p data-testid="title">{data.site.siteMetadata.title}</p>
    <p data-testid="author">{data.site.siteMetadata.author}</p>
    <p data-testid="description">{data.site.siteMetadata.description}</p>
    <p data-testid="social_twitter">{data.site.siteMetadata.social.twitter}</p>
  </>
)

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        author
        description
        social {
          twitter
        }
      }
    }
  }
`
