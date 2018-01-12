import React from "react"

class Article extends React.Component {
  render() {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: this.props.data.asciidoc.html }}
      />
    )
  }
}

export default Article

export const pageQuery = graphql`
  query asciiHTML($id: String!) {
    asciidoc(id: { eq: $id }) {
      html
    }
  }
`
