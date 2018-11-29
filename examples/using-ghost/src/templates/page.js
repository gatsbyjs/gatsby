import React, { Component } from "react"
import { graphql } from "gatsby"
import Layout from "../layouts"

class PageTemplate extends Component {
  render() {
    const currentPage = this.props.data.ghostPage

    return (
      <Layout>
        <h1>{currentPage.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: currentPage.html }} />
      </Layout>
    )
  }
}

export default PageTemplate

export const pageQuery = graphql`
  query($id: String!) {
    ghostPage(id: { eq: $id }) {
      title
      html
    }
  }
`
