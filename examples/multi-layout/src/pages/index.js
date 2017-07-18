import React from "react"

class Index extends React.Component {
  render() {
    return (
      <div>
        <h1>{this.props.data.site.siteMetadata.dummy}</h1>
        <p>This is a demo of the <code>createLayout</code> api, and how to assign a different layout for each page.</p>
      </div>
    )
  }
}

export default Index

export const query = graphql`
query	root {
	site {
    siteMetadata {
      dummy
    }
  }
}
`
