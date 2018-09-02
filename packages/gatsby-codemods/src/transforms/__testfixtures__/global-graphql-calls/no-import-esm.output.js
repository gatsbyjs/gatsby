/* eslint-disable */
// TODO: update codemod to make this test pass
import { graphql } from "gatsby";

export const query = graphql`
  query {
    allSitePages {
      prefix
    }
  }
`;
