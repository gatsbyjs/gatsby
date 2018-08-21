/* eslint-disable */
const {
  Link,
  graphql
} = require(`gatsby`);

export const query = graphql`
  query {
    allSitePages {
      prefix
    }
  }
`;
