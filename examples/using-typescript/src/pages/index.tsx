import * as React from "react";

export default (props: IndexPageProps) =>
  <div>
    <h1>Hello Typescript world!</h1>
    <p>This site is named <strong>{props.data.site.siteMetadata.siteName}</strong></p>
  </div>;

export const pageQuery = graphql`
  query IndexQuery{
    site {
      siteMetadata {
        siteName
      }
    }
  }
`
