/* eslint-disable */
import { graphql } from 'gatsby';

export const query = graphql`
  query {
    allSitePages {
      prefix
    }
  }
`;
