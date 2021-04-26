import { graphql } from "gatsby"

export const TestingFragment = graphql`
  fragment TestingFragment on Site {
    siteMetadata {
      author
    }
  }
`
