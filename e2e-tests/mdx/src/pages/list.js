import React from 'react'
import { graphql } from 'gatsby'

const ListPage = ({ data }) => {
  const firstPage = data.allMdx.nodes[0]
  return (
    <div data-testid="slug">{firstPage.slug}</div>
  )
}

export const query = graphql`
{
    allMdx(filter: {slug: {eq: "src-pages-another"}}) {
      nodes {
        slug
      }
    }
  }
`
export default ListPage
