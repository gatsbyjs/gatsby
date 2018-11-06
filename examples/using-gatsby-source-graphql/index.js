import React from "react"
import { graphql } from "gatsby"
import { makeBlogPath } from "../utils"
import dateformat from "dateformat"

export default ({ data }) => (
  <div>
    <h1>My Gatsby Blog</h1>
    {data.cms.blogPosts.map((blog, i) => (
      <a key={i} href={makeBlogPath(blog)}>
        <h2>
          {dateformat(blog.createdAt, `fullDate`)} - {blog.title}
        </h2>
      </a>
    ))}
  </div>
)

export const query = graphql`
  query {
    cms {
      blogPosts(where: { status: PUBLISHED }, orderBy: createdAt_DESC) {
        title
        createdAt
        slug
      }
    }
  }
`
