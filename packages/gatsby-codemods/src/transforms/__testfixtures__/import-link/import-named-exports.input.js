/* eslint-disable */
import { graphql } from "gatsby"
import Link from "gatsby-link"

export const query = graphql`
  query {
    allSitePages {
      prefix
    }
  }
`
