import React from 'react';
import { graphql } from 'gatsby';

const IndexPage = ({ data }) => (
  <>
    <h1>Pages</h1>
    <ul>
      {data.allMarkdown.map(({ id }) => (
        <li>
          <a href={id} key={id}>
            Page {id}
          </a>
        </li>
      ))}
    </ul>
  </>
);

export default IndexPage;

export const query = graphql`
  {
    allMarkdown {
      id
    }
  }
`;
