import React from "react"
import { Link } from "gatsby"
import { css } from "emotion"
import get from "lodash/get"

import { rhythm, scale } from "../utils/typography"

const indexContainer = css`
  max-width: ${rhythm(30)};
  margin: 0 auto 3rem;
`

const postContainer = css`
  margin-bottom: 0.5rem;
`

const titleContainer = css`
  background-color: #754f9a;
  padding: ${rhythm(1 / 3)};
  margin-bottom: ${rhythm(1)};
  color: #ffffff;
`

const postTitle = css`
  margin-bottom: ${rhythm(1 / 10)};
`

const postDate = css`
  ${scale(-1 / 4)};
  margin-top: 0;
  background-color: #000000;
  color: #ffffff;
  padding: 0.2em 0.5em;
`

const link = css`
  box-shadow: none;
  text-decoration: none;
  color: #ffffff;
`

class BlogIndex extends React.Component {
  render() {
    const posts = get(this, `props.data.allMarkdownRemark.edges`)

    return (
      <div className={indexContainer}>
        <h2>
          Enjoy the nicely highlighted code snippets in the posts below styled
          with the{` `}
          {` `}
          <a href="https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-remark-prismjs">
            Gatsby PrismJS plugin
          </a>
          {` `}
          and
          {` `}
          <a href="https://emotion.sh/">emotion</a>!
        </h2>
        {posts.map(post => {
          if (post.node.path !== `/404/`) {
            return (
              <div key={post.node.frontmatter.path} className={postContainer}>
                <div className={titleContainer}>
                  <h3 className={postTitle}>
                    <Link className={link} to={post.node.frontmatter.path}>
                      {post.node.frontmatter.title}
                    </Link>
                  </h3>
                  <span className={postDate}>{post.node.frontmatter.date}</span>
                </div>
                <p dangerouslySetInnerHTML={{ __html: post.node.excerpt }} />
              </div>
            )
          }
          return null
        })}
      </div>
    )
  }
}

export default BlogIndex

export const pageQuery = graphql`
  query IndexQuery {
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          frontmatter {
            path
            date(formatString: "DD MMMM, YYYY")
          }
          frontmatter {
            title
          }
        }
      }
    }
  }
`
