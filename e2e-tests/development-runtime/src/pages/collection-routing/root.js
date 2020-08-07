import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../../components/layout"

export default function Root(props) {
  return (
    <Layout>
      {props.data.allMarkdownRemark.nodes.map(node => {
        return (
          <Link
            to={node.gatsbyPath}
            data-testid="collection-routing-blog"
            data-testslug={node.fields.slug}
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
        fields {
          slug
        }
        gatsbyPath(
          filePath: "/collection-routing/{MarkdownRemark.fields__slug}"
        )
      }
    }
  }
`
