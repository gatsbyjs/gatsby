import React from "react"

class IndexComponent extends React.Component {
  render() {
    const data1 = this.props.data.allLettersXlsxSheet1.edges
    const data2 = this.props.data.allLettersXlsxSheet2.edges
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th colSpan="2">Sheet1</th>
            </tr>
            <tr>
              <th>Letter</th>
              <th>ASCII Value</th>
            </tr>
          </thead>
          <tbody>
            {data1.map((row, i) => (
              <tr key={`${row.node.value} ${i}`}>
                <td>{row.node.letter}</td>
                <td>{row.node.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table>
          <thead>
            <tr>
              <th colSpan="2">Sheet2</th>
            </tr>
            <tr>
              <th>Letter</th>
              <th>ASCII Value</th>
            </tr>
          </thead>
          <tbody>
            {data2.map((row, i) => (
              <tr key={`${row.node.value} ${i}`}>
                <td>{row.node.letter}</td>
                <td>{row.node.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
}

export default IndexComponent

export const IndexQuery = graphql`
  query IndexQuery {
    allLettersXlsxSheet1 {
      edges {
        node {
          letter
          value
        }
      }
    }
    allLettersXlsxSheet2 {
      edges {
        node {
          letter
          value
        }
      }
    }
  }
`
