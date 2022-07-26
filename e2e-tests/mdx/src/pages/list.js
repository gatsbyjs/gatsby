import React from "react"
import { graphql } from "gatsby"

const ListPage = ({ data }) => {
  const anotherPage = data.another.nodes[0]
  const blogPage = data.blog.nodes[0]
  const aboutPage = data.complex.nodes[0]
  const embedPage = data.embed.nodes[0]

  return (
    <div>
      <div data-testid="mdx-slug">{anotherPage.fields.slug}</div>
      <div data-testid="md-slug">{blogPage.fields.slug}</div>
      <div data-testid="complex-slug">{aboutPage.fields.slug}</div>
      <div data-testid="embed-slug">{embedPage.fields.slug}</div>
    </div>
  )
}

export const query = graphql`
  {
    another: allMdx(filter: { fields: { slug: { eq: "/another" } } }) {
      nodes {
        fields {
          slug
        }
      }
    }
    blog: allMdx(filter: { fields: { slug: { eq: "/my-blog" } } }) {
      nodes {
        fields {
          slug
        }
      }
    }
    complex: allMdx(filter: { fields: { slug: { eq: "/about" } } }) {
      nodes {
        fields {
          slug
        }
      }
    }
    embed: allMdx(filter: { fields: { slug: { eq: "/about/embedded" } } }) {
      nodes {
        fields {
          slug
        }
      }
    }
  }
`
export default ListPage
