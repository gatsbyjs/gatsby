import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../layouts"
import styles from "../styles"
import presets from "../utils/presets"
import { rhythm, scale } from "../utils/typography"

class Index extends React.Component {
  render() {
    const posts = this.props.data.allMarkdownRemark.edges

    return (
      <Layout location={this.props.location}>
        <div>
          <h1
            css={{
              ...scale(4 / 5),
              fontWeight: `800`,
              marginBottom: rhythm(2),
            }}
          >
            This example demonstrates
            {` `}
            <a href="https://www.gatsbyjs.com/plugins/gatsby-transformer-remark/">
              gatsby-transformer-remark
            </a>
            {` `}
            and its plugins. It uses
            {` `}
            <a href="https://github.com/KyleAMathews/typography.js">
              Typography.js
            </a>
            {` `}
            and self-hosted fonts via the
            {` `}
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
            {posts.map(post => (
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
            ))}
          </ul>
        </div>
      </Layout>
    )
  }
}

export default Index

export const pageQuery = graphql`
  {
    allMarkdownRemark(
      limit: 2000
      sort: { frontmatter: { date: ASC } }
      filter: { frontmatter: { draft: { ne: true }, example: { ne: true } } }
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
