/* eslint-disable */
import * as React from 'react';
import { graphql } from 'gatsby';
import { navigateTo } from 'gatsby-link';

export default function Example() {
  return <button onClick={() => navigateTo('/sample')}>waddup</button>;
}

export const pageQuery = graphql`
  query {
    allSitePages {
      prefix
    }
  }
`;
