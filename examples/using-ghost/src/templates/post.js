import React, { Component } from "react"
import { graphql } from "gatsby"
import Layout from "../layouts"

class PostTemplate extends Component {
  render() {
    const currentPost = this.props.data.ghostPost

    return (
      <Layout>
        <h1>{currentPost.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: currentPost.html }} />
      </Layout>
    )
  }
}

export default PostTemplate

export const pageQuery = graphql`
  query($id: String!) {
    ghostPost(id: { eq: $id }) {
      title
      html
      slug
      custom_excerpt
    }
  }
`
