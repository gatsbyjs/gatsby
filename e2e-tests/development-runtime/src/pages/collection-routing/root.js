import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../../components/layout"

export default function Root(props) {
  return (
    <Layout>
      {props.data.allMarkdownRemark.nodes.map(node => {
        return (
          <Link
            to={node.path}
            data-testid="collection-routing-blog"
            data-testslug={node.path}
          >
            {node.frontmatter.title}
          </Link>
        )
      })}
    </Layout>
  )
}

export const query = graphql`
  query AllMarkdown {
    allMarkdownRemark {
      nodes {
        frontmatter {
          title
        }
        path(filePath: "collection-routing/{fields__slug}")
      }
    }
  }
`
