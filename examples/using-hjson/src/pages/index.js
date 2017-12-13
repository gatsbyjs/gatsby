import React from "react"

class IndexComponent extends React.Component {
  render() {
    const { example, letters } = this.props.data

    return (
      <div>
        <h2>Access by filename: example</h2>
        <table>
          <thead>
            <tr>
              <td>KEY</td>
              <td>VALUE</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>key</td>
              <td>{example.data.key}</td>
            </tr>
            <tr>
              <td>contains</td>
              <td>{example.data.contains}</td>
            </tr>
            <tr>
              <td>list</td>
              <td>{example.data.list.join(`,`)}</td>
            </tr>
            <tr>
              <td>realist</td>
              <td>{example.data.realist}</td>
            </tr>
          </tbody>
        </table>
        <h2>Access by type: letters</h2>
        <ul>
          {letters.edges.map(({ node }, id) => <li key={id}>{node.value}</li>)}
        </ul>
      </div>
    )
  }
}

export default IndexComponent

export const IndexQuery = graphql`
  query IndexQuery {
    example: file(name: { eq: "example" }, extension: { eq: "hjson" }) {
      data: childFilesHJson {
        key
        contains
        list
        realist
      }
    }
    letters: allLettersHJson {
      edges {
        node {
          value
        }
      }
    }
  }
`
