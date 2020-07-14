import React from 'react'
import { graphql } from 'gatsby'

const ListPage = ({ data }) => {
  const firstPage = data.allMdx.nodes[0]
  return (
    <div data-testid="slug">{firstPage.slug}</div>
  )
}

export const query = graphql`
  query {
    allMdx {
        nodes {
            slug
        }
    }
  }
`
export default ListPage
