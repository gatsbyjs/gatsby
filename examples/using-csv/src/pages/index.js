import { graphql } from "gatsby"
import React from "react"

function IndexComponent({data}) {
  const data = data.allLettersCsv.edges
return (
<div>
<table>
<thead>
<tr>
<th>Letter</th>
<th>ASCII Value</th>
</tr>
</thead>
<tbody>
{data.map((row, i) => (
<tr key={`${row.node.value} ${i}`}>
<td>{row.node.letter}</td>
<td>{row.node.value}</td>
</tr>
))}
</tbody>
</table>
</div>
);
}

export default IndexComponent

export const IndexQuery = graphql`
  query {
    allLettersCsv {
      edges {
        node {
          letter
          value
        }
      }
    }
  }
`
