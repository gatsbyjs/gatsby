import React from "react"
import { css } from "emotion"
import { rhythm, scale } from "../utils/typography"

import Layout from "../components/layout"

const postContainer = css`
  max-width: ${rhythm(30)};
  margin: auto;
`

const postDate = css`
  ${scale(-1 / 5)};
  display: block;
  marginbottom: ${rhythm(1)};
  margintop: ${rhythm(-1)};
`

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark

    return (
      <Layout pageTitle={post.frontmatter.title}>
        <div className={postContainer}>
          <h1>{post.frontmatter.title}</h1>
          <p className={postDate}>{post.frontmatter.date}</p>
          <div dangerouslySetInnerHTML={{ __html: post.html }} />
          <hr />
        </div>
      </Layout>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostByPath($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      id
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        path
        description
      }
    }
  }
`
