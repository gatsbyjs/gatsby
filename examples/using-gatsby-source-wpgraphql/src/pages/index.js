import React from "react"
import { graphql } from "gatsby"

export default ({ data }) => {
  const { pages } = data.allWpContent

  return (
    <div>
      <h1>My Gatsby Blog</h1>
      <ul>
        {pages.map(page => (
          <li key={page.path}>
            <a href={page.path}>{page.title}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export const query = graphql`
  {
    allWpContent {
      pages: nodes {
        title
        path
      }
    }
  }
`
