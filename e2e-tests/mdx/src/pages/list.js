import React from 'react'
import { graphql } from 'gatsby'

const ListPage = ({ data }) => {
  const anotherPage = data.another.nodes[0]
  const blogPage = data.blog.nodes[0]
  const aboutPage = data.complex.nodes[0]
  const embedPage = data.embed.nodes[0]


  return (
    <div>
      <div data-testid="mdx-slug">{anotherPage.slug}</div>
      <div data-testid="md-slug">{blogPage.slug}</div>
      <div data-testid="complex-slug">{aboutPage.slug}</div>
      <div data-testid="embed-slug">{embedPage.slug}</div>

    </div>
  )
}

export const query = graphql`
{
    another: allMdx(filter: {slug: {eq: "another"}}) {
      nodes {
        slug
      }
    }
    blog: allMdx(filter: {slug: {eq: "my-blog"}}) {
      nodes {
        slug
      }
    }
    complex: allMdx(filter: {slug: {eq: "about/"}}) {
      nodes {
        slug
      }
    }
    embed: allMdx(filter: {slug: {eq: "about/embedded"}}) {
      nodes {
        slug
      }
    }
  }
`
export default ListPage
