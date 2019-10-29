import React from "react"
import { graphql, Link } from "gatsby"

export default ({ data }) => {
  const { pages } = data.allWpContent

  return (
    <div>
      <h1>My Gatsby Blog</h1>
      <ul>
        {pages.map(page => (
          <li key={page.path}>
            <Link to={page.path}>
              {page.contentType} - {page.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export const query = graphql`
  {
    allWpContent(sort: { fields: date, order: DESC }) {
      pages: nodes {
        title
        path
        contentType
      }
    }
  }
`
