/* eslint-disable */
import * as React from 'react';
import { graphql, navigate } from 'gatsby';

export default function Example() {
  return <button onClick={() => navigate('/sample')}>waddup</button>;
}

export const pageQuery = graphql`
  query {
    allSitePages {
      prefix
    }
  }
`;
