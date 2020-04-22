/* eslint-disable */
const {
  graphql,
  Link
} = require(`gatsby`)

export const query = graphql`
  query {
    allSitePages {
      prefix
    }
  }
`
