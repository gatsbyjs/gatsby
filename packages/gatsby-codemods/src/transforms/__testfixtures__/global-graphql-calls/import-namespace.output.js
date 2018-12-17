/* eslint-disable */
import * as Gatsby from "gatsby";

export const query = Gatsby.graphql`
  query {
    allSitePages {
      prefix
    }
  }
`;
