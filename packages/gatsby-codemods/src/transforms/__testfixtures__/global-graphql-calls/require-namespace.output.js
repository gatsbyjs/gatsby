/* eslint-disable */
const Gatsby = require(`gatsby`);

export const query = Gatsby.graphql`
  query {
    allSitePages {
      prefix
    }
  }
`;
