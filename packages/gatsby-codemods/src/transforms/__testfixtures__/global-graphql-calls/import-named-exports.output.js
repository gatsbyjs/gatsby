/* eslint-disable */
import { Link, graphql } from "gatsby";

export const query = graphql`
  query {
    allSitePages {
      prefix
    }
  }
`;
