import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../../components/layout"

export default function Index(props) {
  return (
    <Layout>
      {props.data.markdown.nodes.sort((a, b) => a.fields.slug.localeCompare(b.fields.slug)).map((node, index) => {
        return (
          <Link
            key={node.gatsbyPath}
            to={node.gatsbyPath}
            data-testid={`collection-routing-blog-${index}`}
            data-testslug={node.fields.slug}
          >
            {node.frontmatter.title}
          </Link>
        )
      })}
      {props.data.images.nodes.sort((a, b) => a.parent.name.localeCompare(b.parent.name)).map((node, index) => {
        return (
          <Link
            key={node.gatsbyPath}
            to={node.gatsbyPath}
            data-testid={`collection-routing-image-${index}`}
            data-testimagename={node.parent.name}
          >
            {node.parent.name}
          </Link>
        )
      })}
    </Layout>
  )
}

export const query = graphql`
  query {
    markdown: allMarkdownRemark {
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

    images: allImageSharp {
      nodes {
        parent {
          ... on File {
            name
          }
        }
        gatsbyPath(
          filePath: "/collection-routing/{ImageSharp.parent__(File)__name}"
        )
      }
    }
  }
`
