import React from "react"
import { graphql } from "gatsby"

import Layout from "../layouts"

function Article({data}) {
  return (
<Layout>
<h1>{data.asciidoc.document.title} </h1>
{data.asciidoc.author && (
<table>
<thead>
<tr>
<td colSpan="2">Author metadata</td>
</tr>
</thead>
<tbody>
<tr>
<th>author.fullName</th>
<td>{data.asciidoc.author.fullName}</td>
</tr>
<tr>
<th>author.firstName</th>
<td>{data.asciidoc.author.firstName}</td>
</tr>
<tr>
<th>author.lastName</th>
<td>{data.asciidoc.author.lastName}</td>
</tr>
<tr>
<th>author.middleName</th>
<td>{data.asciidoc.author.middleName}</td>
</tr>
<tr>
<th>author.authorInitials</th>
<td>{data.asciidoc.author.authorInitials}</td>
</tr>
<tr>
<th>author.email</th>
<td>{data.asciidoc.author.email}</td>
</tr>
</tbody>
</table>
)}
{data.asciidoc.revision && (
<table>
<thead>
<tr>
<td colSpan="2">Revision metadata</td>
</tr>
</thead>
<tbody>
<tr>
<th>revision.date</th>
<td>{data.asciidoc.revision.date}</td>
</tr>
<tr>
<th>revision.number</th>
<td>{data.asciidoc.revision.number}</td>
</tr>
<tr>
<th>revision.remark</th>
<td>{data.asciidoc.revision.remark}</td>
</tr>
</tbody>
</table>
)}
<div
dangerouslySetInnerHTML={{ __html: data.asciidoc.html }}
/>
</Layout>
);
}

export default Article

export const pageQuery = graphql`
  query($id: String!) {
    asciidoc(id: { eq: $id }) {
      html
      document {
        title
        subtitle
        main
      }
      revision {
        date
        number
        remark
      }
      author {
        fullName
        firstName
        lastName
        middleName
        authorInitials
        email
      }
    }
  }
`
