import * as React from "react";

// Please note that you can use https://github.com/dotansimha/graphql-code-generator
// to generate all types from graphQL schema
interface IndexPageProps {
  data: {
    site: {
      siteMetadata: {
        siteName: string;
      };
    };
  };
}

export default class extends React.Component<IndexPageProps, {}> {
  constructor(props:IndexPageProps, context: any){
    super(props, context);
  }
  public render() {
    return(
      <div>
        <h1>Hello Typescript world!</h1>
        <p>This site is named <strong>{this.props.data.site.siteMetadata.siteName}</strong></p>
      </div>
    );
  }
}

export const pageQuery = graphql`
  query IndexQuery{
    site {
      siteMetadata {
        siteName
      }
    }
  }
`;
