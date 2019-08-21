import React from "react"
import { graphql } from "gatsby"

import Layout from "../layouts"

class Article extends React.Component {
  render() {
    return (
      <Layout>
        <h1>{this.props.data.asciidoc.document.title} </h1>
        {this.props.data.asciidoc.author && (
          <table>
            <thead>
              <tr>
                <td colSpan="2">Author metadata</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>author.fullName</th>
                <td>{this.props.data.asciidoc.author.fullName}</td>
              </tr>
              <tr>
                <th>author.firstName</th>
                <td>{this.props.data.asciidoc.author.firstName}</td>
              </tr>
              <tr>
                <th>author.lastName</th>
                <td>{this.props.data.asciidoc.author.lastName}</td>
              </tr>
              <tr>
                <th>author.middleName</th>
                <td>{this.props.data.asciidoc.author.middleName}</td>
              </tr>
              <tr>
                <th>author.authorInitials</th>
                <td>{this.props.data.asciidoc.author.authorInitials}</td>
              </tr>
              <tr>
                <th>author.email</th>
                <td>{this.props.data.asciidoc.author.email}</td>
              </tr>
            </tbody>
          </table>
        )}
        {this.props.data.asciidoc.revision && (
          <table>
            <thead>
              <tr>
                <td colSpan="2">Revision metadata</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>revision.date</th>
                <td>{this.props.data.asciidoc.revision.date}</td>
              </tr>
              <tr>
                <th>revision.number</th>
                <td>{this.props.data.asciidoc.revision.number}</td>
              </tr>
              <tr>
                <th>revision.remark</th>
                <td>{this.props.data.asciidoc.revision.remark}</td>
              </tr>
            </tbody>
          </table>
        )}
        <div
          dangerouslySetInnerHTML={{ __html: this.props.data.asciidoc.html }}
        />
      </Layout>
    )
  }
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
