/* eslint-disable */
import { graphql } from "gatsby"

export const GatsbyImageSharpFixed = graphql`
  fragment TestingFragment on Site {
    siteMetadata {
      title
    }
  }
`
