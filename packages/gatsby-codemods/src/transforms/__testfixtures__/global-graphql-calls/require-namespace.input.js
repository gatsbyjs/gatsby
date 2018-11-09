/* eslint-disable */
const Gatsby = require(`gatsby`);

export const query = graphql`
  query {
    allSitePages {
      prefix
    }
  }
`;
