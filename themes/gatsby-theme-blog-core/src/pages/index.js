import React from "react"
import { graphql, Link } from "gatsby"

export default class Create extends React.Component {
  render() {
    return (
      <div>
        <h1>Welcome to Gatsby Theme Blog Core</h1>
        <p>
          This is a core theme that you can use to implement base themes from.
          It defines the data structures, blog post format, and pages you need
          to shadow.
        </p>
        <p>
          Below is a list of pages currently generated from markdown files. Each
          page will show you the data it accepts. The only requirement is that
          you write a React component to shadow the rendering of the page. Put
          this React component in `src/components/blog-post.js` in your child
          theme.
        </p>
        <ul>
          {this.props.data.allMarkdownRemark.edges.map(({ node }) => (
            <li key={node.id}>
              <Link to={node.fields.slug}>{node.frontmatter.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}
export const query = graphql`
  query HomePage {
    allMarkdownRemark {
      edges {
        node {
          id
          excerpt
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
