import React from "react"
import { css } from "emotion"
import get from "lodash/get"
import { rhythm, scale } from "../utils/typography"

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
    console.log(this.props)
    const post = this.props.data.markdownRemark
    const postPath = post.frontmatter.postPath
    const siteTitle = get(this.props, `data.site.siteMetadata.title`)

    return (
      <div className={postContainer}>
        <h1>{post.frontmatter.title}</h1>
        <p className={postDate}>{post.frontmatter.date}</p>
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
        <hr />
      </div>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostByPath($path: String!) {
    site {
      siteMetadata {
        title
      }
    }
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
