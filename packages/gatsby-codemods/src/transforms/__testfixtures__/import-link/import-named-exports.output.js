import { graphql, Link } from "gatsby";

export const query = graphql`
  query {
    allSitePages {
      prefix
    }
  }
`
