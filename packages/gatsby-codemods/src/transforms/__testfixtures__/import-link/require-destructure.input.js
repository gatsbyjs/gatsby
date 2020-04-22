/* eslint-disable */
const { graphql } = require(`gatsby`)
const Link = require("gatsby-link")

export const query = graphql`
  query {
    allSitePages {
      prefix
    }
  }
`
