/* eslint-disable */
const { Link } = require(`gatsby`);

export const query = graphql`
  query {
    allSitePages {
      prefix
    }
  }
`;
