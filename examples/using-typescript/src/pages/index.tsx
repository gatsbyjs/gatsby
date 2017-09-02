import * as React from "react";

// Please note that you can use https://github.com/dotansimha/graphql-code-generator
// to generate all types from graphQL schema
interface IndexPageProps {
  data: {
    site: {
      siteMetadata: {
        siteName: string
        title: string
      };
    };
  };
}

export default (props: IndexPageProps) =>
  <div>
    <h1>Hello Typescript world!</h1>
    <p>This site is named <strong>{props.data.site.siteMetadata.siteName}</strong></p>
    <p>This site's title is <strong>{props.data.site.siteMetadata.title}</strong></p>
  </div>;

export const pageQuery = graphql`
  query IndexQuery{
    site {
      siteMetadata {
        siteName
        title
      }
    }
  }
`;
