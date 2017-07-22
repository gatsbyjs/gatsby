import React from "react"
import Link from "gatsby-link"
import styles from "../styles"
import presets from "../utils/presets"
import { rhythm, scale } from "../utils/typography"

class Index extends React.Component {
  render() {
    const posts = this.props.data.allMarkdownRemark.edges
    const author = this.props.data.site.siteMetadata.author
    const authorTitle = this.props.data.site.siteMetadata.authorTitle
    const description = this.props.data.site.siteMetadata.description

    return (
      <div>
        <div>
          <h1
            css={{
              ...scale(4 / 5),
              fontWeight: `800`,
              marginBottom: rhythm(2),
            }}
          >
            This example demonstrates{` `}
            <a href="https://www.gatsbyjs.org/packages/gatsby-transformer-remark/">
              gatsby-transformer-remark
            </a>
            {` `}
            and its plugins. It uses{` `}
            <a href="https://github.com/KyleAMathews/typography.js">
              Typography.js
            </a>
            {` `}
            and self-hosted fonts via the{` `}
            <a href="https://github.com/KyleAMathews/typefaces">Typefaces</a>
            {` `}
            project.
            {}
          </h1>
          <ul
            css={{
              marginBottom: rhythm(2),
              marginTop: rhythm(2),
              marginLeft: 0,
              listStyle: `none`,
            }}
          >
            {posts.map(post =>
              <li key={post.node.fields.slug}>
                <span
                  css={{
                    color: styles.colors.light,
                    display: `block`,
                    [presets.Tablet]: {
                      float: `right`,
                      marginLeft: `1rem`,
                    },
                  }}
                >
                  {post.node.frontmatter.date}
                </span>
                <Link to={post.node.fields.slug} className="link-underline">
                  {post.node.frontmatter.title}
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    )
  }
}

export default Index

export const pageQuery = graphql`
  query IndexQuery {
    site {
      siteMetadata {
        title
        author
        description
      }
    }
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { draft: { ne: true } } }
    ) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
            date(formatString: "MMMM DD, YYYY")
          }
        }
      }
    }
  }
`
