/* eslint-disable */
import Gatsby, { graphql } from "gatsby";

export const query = graphql`
  query {
    allSitePages {
      prefix
    }
  }
`;
